from algopy import *


class Context7Marketplace(ARC4Contract):
    """Context7 AI Marketplace Smart Contract"""
    
    def __init__(self) -> None:
        # Local state schema
        self.ipfs_hash = LocalState(Bytes)
        self.price = LocalState(UInt64)
        self.seller = LocalState(Account)
    
    @arc4.baremethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """Allow users to opt into the marketplace"""
        return
    
    @arc4.abimethod
    def create_context(self, ipfs_hash: arc4.String, price: arc4.UInt64) -> None:
        """List a new AI context for sale"""
        # Ensure price is greater than 0
        assert price.native > 0, "Price must be greater than 0"
        
        # Store context info in local state
        self.ipfs_hash[Txn.sender] = ipfs_hash.native.bytes
        self.price[Txn.sender] = price.native
        self.seller[Txn.sender] = Txn.sender
    
    @arc4.abimethod
    def purchase_context(self, seller: Account, payment: gtxn.PaymentTransaction) -> arc4.String:
        """Purchase an AI context"""
        # Platform and developer fee addresses (TestNet)
        platform_fee_address = Account("7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q")
        developer_fee_address = Account("GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A")
        
        # Get the price from seller's local state
        price = self.price[seller]
        
        # Verify payment transaction
        assert payment.receiver == Global.current_application_address
        assert payment.amount == price
        assert payment.sender == Txn.sender
        
        # Calculate fees (90% seller, 5% platform, 5% developer)
        platform_fee = price * 5 // 100
        developer_fee = price * 5 // 100
        seller_proceeds = price - platform_fee - developer_fee
        
        # Send payments via inner transactions
        itxn.Payment(
            receiver=seller,
            amount=seller_proceeds,
            fee=0,
        ).submit()
        
        itxn.Payment(
            receiver=platform_fee_address,
            amount=platform_fee,
            fee=0,
        ).submit()
        
        itxn.Payment(
            receiver=developer_fee_address,
            amount=developer_fee,
            fee=0,
        ).submit()
        
        # Return the IPFS hash to the buyer
        return arc4.String.from_bytes(self.ipfs_hash[seller])
