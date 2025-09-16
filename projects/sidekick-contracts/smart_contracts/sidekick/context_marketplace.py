# contracts/context_marketplace.py
from beaker import *
from pyteal import *

# Platform and developer fee addresses
PLATFORM_FEE_ADDRESS = Addr("REPLACE_WITH_YOUR_PLATFORM_TESTNET_ADDRESS")
DEVELOPER_FEE_ADDRESS = Addr("REPLACE_WITH_YOUR_DEVELOPER_TESTNET_ADDRESS")

class AppState:
    # State for each user who lists a context
    ipfs_hash = LocalStateValue(TealType.bytes)
    price = LocalStateValue(TealType.uint64)
    seller = LocalStateValue(TealType.bytes)

app = Application("Context7Marketplace", state=AppState())

@app.create
def create():
    return Approve()

@app.opt_in
def create_context(ipfs_cid: abi.String, price: abi.Uint64):
    # A user opts-in to the contract to list a new context
    return Seq(
        Assert(price.get() > Int(0)), # Ensure price is not zero
        app.state.ipfs_hash[Txn.sender()].set(ipfs_cid.get()),
        app.state.price[Txn.sender()].set(price.get()),
        app.state.seller[Txn.sender()].set(Txn.sender()),
        Approve(),
    )

@app.external
def purchase_context(payment: abi.PaymentTransaction, seller: abi.Account):
    price = app.state.price[seller.address()]
    
    # Calculate fees (90/5/5 split)
    platform_fee = (price * Int(5)) / Int(100)
    developer_fee = (price * Int(5)) / Int(100)
    seller_proceeds = price - platform_fee - developer_fee
    
    return Seq(
        # Verify the payment transaction
        Assert(payment.get().receiver() == Global.current_application_address()),
        Assert(payment.get().amount() == price),
        Assert(payment.get().sender() == Txn.sender()),
        
        # Send funds using Inner Transactions
        InnerTxnBuilder.Execute({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: seller.address(),
            TxnField.amount: seller_proceeds,
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Execute({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: PLATFORM_FEE_ADDRESS,
            TxnField.amount: platform_fee,
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Execute({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: DEVELOPER_FEE_ADDRESS,
            TxnField.amount: developer_fee,
            TxnField.fee: Int(0),
        }),
        Approve(),
    )
