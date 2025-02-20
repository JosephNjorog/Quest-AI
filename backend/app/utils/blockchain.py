# app/utils/blockchain.py
from typing import Dict, Any, Optional, List, Tuple
from web3 import Web3
from web3.types import TxParams, TxReceipt
from eth_account.messages import encode_defunct
from app.core.config import settings
import time
import json
import os
from web3.middleware import geth_poa_middleware

class BlockchainUtils:
    def __init__(self):
        """Initialize connection to blockchain."""
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI))
        
        # Add middleware for Avalanche C-Chain compatibility
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        self.chain_id = settings.CHAIN_ID
        self.max_retries = 3
        self.gas_price_multiplier = 1.1  # 10% buffer on gas price
        
        # Gas limits per contract function (can be adjusted based on empirical data)
        self.gas_limits = {
            "quest.startQuest": 200000,
            "hero.levelUp": 150000,
            "quest.claimRewards": 180000,
            "hero.summon": 250000,
            "default": 300000  # Default gas limit
        }
    
    def is_connected(self) -> bool:
        """Check if connected to blockchain."""
        return self.w3.is_connected()
    
    def get_gas_price(self) -> int:
        """Get current gas price with multiplier applied."""
        try:
            base_gas_price = self.w3.eth.gas_price
            return int(base_gas_price * self.gas_price_multiplier)
        except Exception:
            # Fallback gas price in case of API failure (40 Gwei)
            return 40 * 10**9
    
    def get_transaction_count(self, address: str) -> int:
        """Get transaction count (nonce) for address."""
        return self.w3.eth.get_transaction_count(address, 'pending')
    
    def estimate_gas(
        self, 
        contract_function, 
        sender_address: str, 
        function_identifier: str = "default"
    ) -> int:
        """Estimate gas for contract function call with fallback."""
        try:
            estimated_gas = contract_function.estimate_gas({'from': sender_address})
            # Add 20% buffer to estimated gas
            return int(estimated_gas * 1.2)
        except Exception:
            # Use predefined gas limits as fallback
            return self.gas_limits.get(function_identifier, self.gas_limits["default"])
    
    def sign_transaction(
        self,
        account_key: str,
        transaction: TxParams
    ) -> str:
        """Sign a transaction with private key."""
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account_key)
        return signed_tx.rawTransaction.hex()
    
    def sign_message(self, account_key: str, message: str) -> Dict[str, Any]:
        """Sign a message with private key."""
        message_encoded = encode_defunct(text=message)
        signed_message = self.w3.eth.account.sign_message(message_encoded, account_key)
        return {
            "messageHash": signed_message.messageHash.hex(),
            "r": signed_message.r,
            "s": signed_message.s,
            "v": signed_message.v,
            "signature": signed_message.signature.hex()
        }
    
    def verify_signature(
        self,
        message: str,
        signature: str,
        address: str
    ) -> bool:
        """Verify a signature matches the expected signer address."""
        message_encoded = encode_defunct(text=message)
        recovered_address = self.w3.eth.account.recover_message(message_encoded, signature=signature)
        return recovered_address.lower() == address.lower()
    
    async def send_transaction(
        self,
        signed_tx: str,
        wait_for_receipt: bool = True
    ) -> Dict[str, Any]:
        """Send a signed transaction and optionally wait for receipt."""
        try:
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(bytes.fromhex(signed_tx[2:] if signed_tx.startswith("0x") else signed_tx))
            tx_hash_hex = tx_hash.hex()
            
            if not wait_for_receipt:
                return {
                    "success": True,
                    "tx_hash": tx_hash_hex,
                    "receipt": None
                }
            
            # Wait for receipt with timeout and retry
            receipt = self._wait_for_transaction_receipt(tx_hash_hex)
            
            if receipt is None:
                return {
                    "success": False,
                    "tx_hash": tx_hash_hex,
                    "receipt": None,
                    "error": "Transaction receipt timeout"
                }
            
            # Check if transaction succeeded
            if receipt.status == 1:
                return {
                    "success": True,
                    "tx_hash": tx_hash_hex,
                    "receipt": dict(receipt)
                }
            else:
                return {
                    "success": False,
                    "tx_hash": tx_hash_hex,
                    "receipt": dict(receipt),
                    "error": "Transaction reverted"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tx_hash": None,
                "receipt": None
            }
    
    def _wait_for_transaction_receipt(
        self,
        tx_hash: str,
        timeout: int = 120,
        poll_interval: float = 0.5
    ) -> Optional[TxReceipt]:
        """Wait for transaction receipt with timeout."""
        start_time = time.time()
        while True:
            try:
                receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                if receipt is not None:
                    return receipt
            except Exception:
                # Transaction not yet in mempool or blockchain
                pass
            
            if time.time() - start_time > timeout:
                return None
                
            time.sleep(poll_interval)
    
    def get_token_balance(
        self,
        token_address: str,
        wallet_address: str
    ) -> Dict[str, Any]:
        """Get ERC20 token balance for a wallet."""
        try:
            # Load standard ERC20 ABI
            abi_path = os.path.join("app/contracts/abi", "ERC20.json")
            with open(abi_path, "r") as f:
                erc20_abi = json.load(f)
            
            # Create contract instance
            token_contract = self.w3.eth.contract(address=token_address, abi=erc20_abi)
            
            # Get balance and decimals
            balance = token_contract.functions.balanceOf(wallet_address).call()
            decimals = token_contract.functions.decimals().call()
            symbol = token_contract.functions.symbol().call()
            
            # Calculate human-readable balance
            human_balance = balance / (10 ** decimals)
            
            return {
                "success": True,
                "token_address": token_address,
                "wallet_address": wallet_address,
                "balance": balance,
                "human_balance": human_balance,
                "decimals": decimals,
                "symbol": symbol
            }
        except Exception as e:
            return {
                "success": False,
                "token_address": token_address,
                "wallet_address": wallet_address,
                "error": str(e)
            }
    
    def get_native_balance(self, wallet_address: str) -> Dict[str, Any]:
        """Get native token (AVAX) balance for a wallet."""
        try:
            # Get balance in wei
            balance_wei = self.w3.eth.get_balance(wallet_address)
            
            # Convert to Ether (AVAX)
            balance_avax = self.w3.from_wei(balance_wei, 'ether')
            
            return {
                "success": True,
                "wallet_address": wallet_address,
                "balance_wei": balance_wei,
                "balance_avax": balance_avax
            }
        except Exception as e:
            return {
                "success": False,
                "wallet_address": wallet_address,
                "error": str(e)
            }
    
    def create_transaction_params(
        self,
        from_address: str,
        to_address: str,
        value: int = 0,
        data: str = "",
        gas_limit: Optional[int] = None,
        gas_price: Optional[int] = None,
        nonce: Optional[int] = None
    ) -> TxParams:
        """Create transaction parameters."""
        # Use provided values or get from blockchain
        if gas_price is None:
            gas_price = self.get_gas_price()
        
        if nonce is None:
            nonce = self.get_transaction_count(from_address)
        
        tx_params = {
            'from': from_address,
            'to': to_address,
            'value': value,
            'gas': gas_limit if gas_limit is not None else self.gas_limits["default"],
            'gasPrice': gas_price,
            'nonce': nonce,
            'chainId': self.chain_id
        }
        
        if data:
            tx_params['data'] = data
            
        return tx_params