import smartpy as sp
class SavingSmartContract(sp.Contract):
    def __init__(self):
        self.init(savingAccounts = sp.big_map())

    # Defines the addSaving entry point.
    @sp.entry_point
    def savingAccounts(self, params):
        sp.verify(params.id !=0, "Enter your savingAccount id")
        sp.if self.data.savingAccounts.contains(params.id):
            sp.failwith("The id already exist")
        sp.else:    
            # Verifies if mandatory fields have values. 
            sp.verify(params.id != 0)
            # Declare the parameter types.
            sp.set_type(params.id, sp.TInt)
            sp.set_type(params.publicKey, sp.TAddress)
            sp.set_type(params.date, sp.TTimestamp)
            sp.set_type(params.withdrawDate, sp.TTimestamp)
            sp.set_type(params.name, sp.TString)

            # Defines a savingAccount record, so we can add to a Map.
            savingAccount = sp.record(name=params.name, walletBalance=sp.tez(0), publicKey=params.publicKey, date=params.date, withdrawDate=params.withdrawDate, saving =sp.list([]), demandWithdraw = sp.map())
            
            # Adds the new savingAccount record to a Map (that will reside in the contract's storage).
            self.data.savingAccounts[params.id] = savingAccount   

    @sp.entry_point
    def addSaving(self, params):
        #verify if he is the owner of this account
        sp.verify(params.id !=0, "Enter the Account Id")
        sp.if self.data.savingAccounts.contains(params.id):

            # Declare the parameter types.  
            sp.set_type(params.id, sp.TInt)
            sp.set_type(params.publicKey, sp.TAddress)
            sp.set_type(params.amount, sp.TMutez)
            sp.set_type(params.date, sp.TTimestamp)

            #Add every saving amount to walletBalance
            WalletBalance= self.data.savingAccounts[params.id].walletBalance
            NewWalletBalance= WalletBalance + params.amount
            self.data.savingAccounts[params.id].walletBalance=NewWalletBalance

            #Verify if the saving is not from an unkown public key
            saverAddress = self.data.savingAccounts[params.id].publicKey
            sp.verify(params.publicKey==saverAddress, "Only the account owner can save in this account")


            #verify if the amount is valid before permitting withdraw
            addSavings = sp.record(amount = params.amount, date=params.date)
            self.data.savingAccounts[params.id].saving.push(addSavings)
        sp.else: 
            sp.failwith("The Saving Account id you entered doesn't exist")

    @sp.entry_point
    def demandWithdraw(self, params):
        #verify if SavingAccount id exist
        sp.verify(params.id !=0, "Enter your SavingAccount id")
        sp.if self.data.savingAccounts.contains(params.id):
            # Verifies if mandatory fields have values. 
            sp.verify(params.id != 0)
    
            # Declare the parameter types.  
            sp.set_type(params.id, sp.TInt)
            sp.set_type(params.publicKey, sp.TAddress)
            sp.set_type(params.amount, sp.TMutez)
            sp.set_type(params.date, sp.TTimestamp)

            #Verify if it's time to withdraw
            withdrawDate = self.data.savingAccounts[params.id].withdrawDate
            sp.verify(params.date >= withdrawDate, "Sorry, it's not yet withdrawal date")

            #Verify if the withdrawal demand is not from an unkown public key
            saverAddress = self.data.savingAccounts[params.id].publicKey
            sp.verify(params.publicKey==saverAddress, "Only the account owner can demand withdraw")

            #Verify that the withdraw amount is not superior to it's wallet balance
            WalletBalance= self.data.savingAccounts[params.id].walletBalance
            sp.verify(params.amount<=WalletBalance, "Sorry Amount is beyong wallet balance")

            #Deduct withdrawal amount from wallatBalance
            WalletBalance= self.data.savingAccounts[params.id].walletBalance
            NewWalletBalance= WalletBalance - params.amount
            self.data.savingAccounts[params.id].walletBalance=NewWalletBalance


            withdraw = sp.record(id= params.id, publicKey = params.publicKey, amount = params.amount, date=params.date)
            self.data.savingAccounts[params.id].demandWithdraw[params.publicKey] = withdraw
        sp.else: 
            sp.failwith("The savingAccount id doesn't exist")



    @sp.add_test(name = "SavingSmartContract")
    def test():
        # Instantiate a contract inherited from the Saving Class.
        myContract = SavingSmartContract()
        
        # Defines a test scenario.
        scenario = sp.test_scenario()
        scenario.h2("Let's have a look at Saving Smart contract Testing")

        # Adds the contract to the test scenario.
        scenario += myContract

        scenario.h2("Add savingAccount")
        #Add savingAccount
        scenario += myContract.savingAccounts(id=1, name="Travel saving", publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), withdrawDate=sp.timestamp(1653147907), date=sp.timestamp(12445598)).run(valid=True)

        scenario.h2("Add saving")
        #Add saving
        scenario += myContract.addSaving(id=1, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), amount=sp.tez(42), date=sp.timestamp(12445598)).run(valid=True)
        scenario += myContract.addSaving(id=1, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), amount=sp.tez(58), date=sp.timestamp(12445598)).run(valid=True)
        scenario += myContract.addSaving(id=2, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), amount=sp.tez(42), date=sp.timestamp(12445598)).run(valid=False)

        scenario.h2("Demand withdraw")
        #Add saving
        scenario += myContract.demandWithdraw(id=1, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), amount=sp.tez(68), date=sp.timestamp(1653155107)).run(valid=True)
        scenario += myContract.demandWithdraw(id=1, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZGFy"), amount=sp.tez(42), date=sp.timestamp(1653155107)).run(valid=False)
        scenario += myContract.demandWithdraw(id=1, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), amount=sp.tez(130), date=sp.timestamp(1653155107)).run(valid=False)
        scenario += myContract.demandWithdraw(id=1, publicKey=sp.address("tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv"), amount=sp.tez(42), date=sp.timestamp(1649662497)).run(valid=False)
