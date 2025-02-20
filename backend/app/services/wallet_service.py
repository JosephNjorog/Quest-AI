import os
import json
import secrets
from typing import Dict, Any, Optional
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3

from ..models.wallet import Wallet
from ..utils.encryption import encrypt_data, decrypt_data
from ..utils.logger import get_logger

logger = get_logger(__name__)

class WalletService:
    def __init__(self, web3_provider: str, encryption_key: str = None):
        """Initialize the wallet service"""
        self.w3 = Web3(Web3.HTTPProvider(web3_provider))
        self.encryption_key = encryption_key or os.environ.get('ENCRYPTION_KEY')
        if not self.encryption_key:
            # Generate a random encryption key if none provided
            # In production, this should be stored securely and consistently
            self.encryption_key = secrets.token_hex(32)
            logger.warning("No encryption key provided, generated temporary key")
        
        # In-memory storage - in production use a secure database
        self._wallets: Dict[str, Wallet] = {}
    
    def create_wallet(self) -> Wallet:
        """Create a new wallet"""
        account = Account.create()
        wallet = Wallet(
            address=account.address,
            private_key=account.key.hex(),
            public_key=account.address
        )
        self._wallets[wallet.address] = wallet
        return wallet
    
    def import_wallet(self, private_key: str) -> Wallet:
        """Import a wallet using private key"""
        if not private_key.startswith('0x'):
            private_key = '0x' + private_key
            
        account = Account.from_key(private_key)
        wallet = Wallet(
            address=account.address,
            private_key=private_key,
            public_key=account.address
        )
        self._wallets[wallet.address] = wallet
        return wallet
    
    def get_wallet(self, address: str) -> Optional[Wallet]:
        """Get a wallet by address"""
        return self._wallets.get(address)
    
    def verify_wallet_signature(self, address: str, message: str, signature: str) -> bool:
        """Verify a message was signed by the wallet owner"""
        try:
            message_hash = encode_defunct(text=message)
            recovered_address = Account.recover_message(message_hash, signature=signature)
            return recovered_address.lower() == address.lower()
        except Exception as e:
            logger.error(f"Signature verification failed: {str(e)}")
            return False
    
    def store_encrypted_wallet(self, wallet: Wallet, user_id: str) -> str:
        """Securely store wallet with encryption"""
        wallet_data = {
            "address": wallet.address,
            "private_key": wallet.private_key
        }
        
        encrypted = encrypt_data(json.dumps(wallet_data), self.encryption_key)
        # In production, store in a secure database
        storage_key = f"wallet:{user_id}:{wallet.address}"
        
        # Mock storage - in production use a secure database
        with open(f"./secure_storage/{storage_key}.enc", "w") as f:
            f.write(encrypted)
            
        return storage_key
    
    def load_encrypted_wallet(self, storage_key: str) -> Optional[Wallet]:
        """Load an encrypted wallet"""
        try:
            # Mock storage - in production use a secure database
            with open(f"./secure_storage/{storage_key}.enc", "r") as f:
                encrypted_data = f.read()
                
            decrypted_data = decrypt_data(encrypted_data, self.encryption_key)
            wallet_data = json.loads(decrypted_data)
            
            wallet = Wallet(
                address=wallet_data["address"],
                private_key=wallet_data["private_key"],
                public_key=wallet_data["address"]
            )
            self._wallets[wallet.address] = wallet
            return wallet
        except Exception as e:
            logger.error(f"Failed to load encrypted wallet: {str(e)}")
            return None
    
    def get_wallet_balance(self, address: str) -> Dict[str, Any]:
        """Get wallet balance information"""
        try:
            avax_balance = self.w3.eth.get_balance(address)
            return {
                "avax": self.w3.from_wei(avax_balance, 'ether'),
                "avax_wei": avax_balance
            }
        except Exception as e:
            logger.error(f"Failed to get wallet balance: {str(e)}")
            return {"error": str(e)}
    
    async def get_token_balances(self, address: str, token_addresses: list) -> Dict[str, float]:
        """Get ERC20 token balances"""
        balances = {}
        
        # Basic ERC20 ABI for balanceOf function
        erc20_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            }
        ]
        
        for token_address in token_addresses:
            try:
                token_contract = self.w3.eth.contract(address=token_address, abi=erc20_abi)
                raw_balance = token_contract.functions.balanceOf(address).call()
                decimals = token_contract.functions.decimals().call()
                symbol = token_contract.functions.symbol().call()
                
                balance = raw_balance / (10 ** decimals)
                balances[symbol] = balance
            except Exception as e:
                logger.error(f"Failed to get token balance for {token_address}: {str(e)}")
                continue
                
        return balances
    
    def sign_message(self, wallet: Wallet, message: str) -> str:
        """Sign a message with the wallet's private key"""
        message_hash = encode_defunct(text=message)
        signed_message = Account.sign_message(message_hash, wallet.private_key)
        return signed_message.signature.hex()