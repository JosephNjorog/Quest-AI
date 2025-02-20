"""
Transaction Manager Service for QuestMind AI Agent
Handles blockchain transactions, gas estimation, and transaction monitoring
"""

import asyncio
import time
from typing import Dict, Any, Optional, List

from web3 import Web3
from eth_account.account import Account
from eth_account.signers.local import LocalAccount

from ..models.transaction import Transaction
from ..models.wallet import Wallet
from ..utils.logger import get_logger

logger = get_logger(__name__)

class TransactionManager:
    def __init__(self, web3_provider: str, chain_id: int = 43114):
        """Initialize the transaction manager with Web3 provider"""
        self.w3 = Web3(Web3.HTTPProvider(web3_provider))
        self.chain_id = chain_id
        self.pending_transactions: Dict[str, Transaction] = {}
        
    async def estimate_gas(self, to_address: str, data: str, value: int = 0) -> int:
        """Estimate gas for a transaction"""
        try:
            gas_estimate = self.w3.eth.estimate_gas({
                'to': to_address,
                'data': data,
                'value': value
            })
            # Add 20% buffer for safety
            return int(gas_estimate * 1.2)
        except Exception as e:
            logger.error(f"Gas estimation failed: {str(e)}")
            # Default gas limit for Avalanche C-Chain
            return 500000
    
    def get_gas_price(self) -> int:
        """Get current gas price with dynamic adjustments based on network congestion"""
        try:
            base_fee = self.w3.eth.get_block('latest').baseFeePerGas
            # Add priority fee (tip) - adjust based on urgency
            priority_fee = self.w3.eth.max_priority_fee
            return base_fee + priority_fee
        except Exception as e:
            logger.error(f"Failed to get gas price: {str(e)}")
            # Fallback to standard gas price
            return self.w3.eth.gas_price
    
    async def build_transaction(self, wallet: Wallet, to_address: str, 
                               data: str, value: int = 0) -> Dict[str, Any]:
        """Build a transaction object ready for signing"""
        nonce = self.w3.eth.get_transaction_count(wallet.address)
        gas_price = self.get_gas_price()
        gas_limit = await self.estimate_gas(to_address, data, value)
        
        tx = {
            'chainId': self.chain_id,
            'nonce': nonce,
            'to': to_address,
            'value': value,
            'gas': gas_limit,
            'gasPrice': gas_price,
            'data': data,
        }
        
        # Check if user has enough balance
        balance = self.w3.eth.get_balance(wallet.address)
        tx_cost = gas_limit * gas_price + value
        if balance < tx_cost:
            raise ValueError(f"Insufficient funds. Need {self.w3.from_wei(tx_cost, 'ether')} AVAX, but have {self.w3.from_wei(balance, 'ether')} AVAX")
            
        return tx
    
    def sign_transaction(self, private_key: str, transaction: Dict[str, Any]) -> str:
        """Sign a transaction with the provided private key"""
        account: LocalAccount = Account.from_key(private_key)
        signed_tx = account.sign_transaction(transaction)
        return signed_tx.rawTransaction
    
    async def send_transaction(self, signed_tx: str) -> str:
        """Send a signed transaction to the network"""
        try:
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx)
            tx_hash_hex = tx_hash.hex()
            logger.info(f"Transaction sent: {tx_hash_hex}")
            
            # Add to pending transactions
            self.pending_transactions[tx_hash_hex] = Transaction(
                hash=tx_hash_hex,
                status="pending",
                timestamp=int(time.time())
            )
            return tx_hash_hex
        except Exception as e:
            logger.error(f"Failed to send transaction: {str(e)}")
            raise
    
    async def monitor_transaction(self, tx_hash: str, max_attempts: int = 60) -> Dict[str, Any]:
        """Monitor a transaction until it's mined or times out"""
        attempts = 0
        
        while attempts < max_attempts:
            try:
                receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                if receipt is not None:
                    # Update transaction status
                    if tx_hash in self.pending_transactions:
                        self.pending_transactions[tx_hash].status = "confirmed" if receipt["status"] == 1 else "failed"
                        self.pending_transactions[tx_hash].block_number = receipt["blockNumber"]
                        self.pending_transactions[tx_hash].gas_used = receipt["gasUsed"]
                    
                    return {
                        "success": receipt["status"] == 1,
                        "block_number": receipt["blockNumber"],
                        "gas_used": receipt["gasUsed"],
                        "logs": receipt["logs"]
                    }
            except Exception as e:
                logger.debug(f"Transaction {tx_hash} not yet mined: {str(e)}")
            
            attempts += 1
            await asyncio.sleep(2)
        
        # If we get here, transaction is still pending after timeout
        logger.warning(f"Transaction {tx_hash} is still pending after {max_attempts} attempts")
        return {"success": False, "status": "pending", "error": "Transaction mining timeout"}
    
    async def execute_transaction(self, wallet: Wallet, to_address: str, 
                                 data: str, value: int = 0, wait_for_receipt: bool = True) -> Dict[str, Any]:
        """
        End-to-end transaction execution:
        1. Build transaction
        2. Sign transaction
        3. Send transaction
        4. Optionally wait for receipt
        """
        try:
            tx = await self.build_transaction(wallet, to_address, data, value)
            signed_tx = self.sign_transaction(wallet.private_key, tx)
            tx_hash = await self.send_transaction(signed_tx)
            
            result = {"tx_hash": tx_hash, "status": "sent"}
            
            if wait_for_receipt:
                receipt_result = await self.monitor_transaction(tx_hash)
                result.update(receipt_result)
            
            return result
        except Exception as e:
            logger.error(f"Transaction execution failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_transaction_history(self, address: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get transaction history for an address"""
        # This would typically use an explorer API like SnowTrace (Avalanche's Etherscan)
        # For now, we'll return a placeholder implementation
        # In production, integrate with SnowTrace API or a similar service
        
        # Mock implementation
        latest_block = self.w3.eth.block_number
        transactions = []
        
        for i in range(limit):
            block_num = latest_block - i
            if block_num < 0:
                break
                
            block = self.w3.eth.get_block(block_num, full_transactions=True)
            
            for tx in block.transactions:
                if isinstance(tx, dict) and (tx.get('from') == address or tx.get('to') == address):
                    transactions.append({
                        "hash": tx.get('hash').hex(),
                        "block_number": block_num,
                        "from": tx.get('from'),
                        "to": tx.get('to'),
                        "value": self.w3.from_wei(tx.get('value'), 'ether'),
                        "timestamp": block.timestamp
                    })
                    
                    if len(transactions) >= limit:
                        return transactions
        
        return transactions