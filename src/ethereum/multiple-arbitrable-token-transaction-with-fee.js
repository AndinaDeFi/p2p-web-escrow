import MultipleArbitrableTokenTransactionWithFee from "./MultipleArbitrableTokenTransactionWithFee.json";
import web3 from "./web3";

export const STATUS = {
  0: "NoDispute",
  1: "WaitingSender",
  2: "WaitingReceiver",
  3: "DisputeCreated",
  4: "Resolved",
};

export const SENDER_WINS = 1;
export const RECEIVER_WINS = 2;

export const contractInstance = (address) =>
  new web3.eth.Contract(MultipleArbitrableTokenTransactionWithFee.abi, address);

export const deploy = (
  sender,
  arbitrator,
  arbitratorExtra,
  feeRecipient,
  feeRecipientBasisPoint,
  feeTimeout
) =>
  new web3.eth.Contract(MultipleArbitrableTokenTransactionWithFee.abi)
    .deploy({
      arguments: [
        arbitrator,
        arbitratorExtra,
        feeRecipient,
        feeRecipientBasisPoint,
        feeTimeout,
      ],
      data: MultipleArbitrableTokenTransactionWithFee.bytecode,
    })
    .send({ from: sender });

export const createTransaction = (
  senderAddress,
  amount,
  token,
  instanceAddress,
  timeoutPayment,
  receiverAddress,
  metaevidence
) =>
  contractInstance(instanceAddress)
    .methods.createTransaction(
      amount,
      token,
      timeoutPayment,
      receiverAddress,
      metaevidence
    )
    .send({ from: senderAddress });

export const status = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const status = res.status;
  return status;
};

export const arbitrator = async (instanceAddress) => {
  const arbitrator = await contractInstance(instanceAddress)
    .methods.arbitrator()
    .call();
  return arbitrator;
};

export const feeTimeout = async (instanceAddress) => {
  const feeTimeout = await contractInstance(instanceAddress)
    .methods.feeTimeout()
    .call();
  return feeTimeout;
};

export const value = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const value = res.amount;
  return value;
};
export const token = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const token = res.token;
  return token;
};

export const payee = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const payee = res.receiver;
  return payee;
};

export const payer = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const payer = res.sender;
  return payer;
};

export const timeoutPayment = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const timeoutPayment = res.timeoutPayment;
  return timeoutPayment;
};

export const disputeID = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const disputeID = res.disputeId;
  return disputeID;
};

export const lastInteraction = async (instanceAddress, transactionID) => {
  const res = await contractInstance(instanceAddress)
    .methods.transactions(transactionID)
    .call();
  const lastInteraction = res.lastInteraction;
  return lastInteraction;
};

export const pay = (amount, transactionID, senderAddress, instanceAddress) =>
  contractInstance(instanceAddress)
    .methods.pay(transactionID, amount)
    .send({ from: senderAddress });

export const reimburse = (
  amount,
  transactionID,
  senderAddress,
  instanceAddress
) =>
  contractInstance(instanceAddress)
    .methods.reimburse(transactionID, amount)
    .send({ from: senderAddress });

export const executeTransaction = (
  transactionID,
  senderAddress,
  instanceAddress
) =>
  contractInstance(instanceAddress)
    .methods.executeTransaction(transactionID)
    .send({ from: senderAddress });

export const payArbitrationFeeBySender = (
  value,
  transactionID,
  senderAddress,
  instanceAddress
) =>
  contractInstance(instanceAddress)
    .methods.payArbitrationFeeBySender(transactionID)
    .send({ from: senderAddress, value: value });

export const payArbitrationFeeByReceiver = (
  value,
  transactionID,
  senderAddress,
  instanceAddress
) =>
  contractInstance(instanceAddress)
    .methods.payArbitrationFeeByReceiver(transactionID)
    .send({ from: senderAddress, value: value });

export const getRuling = async (arbitrator, disputeID, instanceAddress) => {
  let events = await contractInstance(instanceAddress).getPastEvents(
    "Ruling",
    {
      filter: {
        _arbitrator: arbitrator,
        _disputeID: disputeID,
        fromBlock: 0,
      },
    },
    function (event) {
      return event;
    }
  );
  // TODO: In case of appleals, take last one
  return events[0].returnValues._ruling;
};

export const getPayments = async (transactionID, instanceAddress) => {
  let events = await contractInstance(instanceAddress).getPastEvents(
    "Payment",
    {
      filter: {
        _transactionID: transactionID,
        fromBlock: 0,
      },
    },
    function (event) {
      return event;
    }
  );
  return events;
};

export const submitEvidence = (
  evidence,
  transactionID,
  senderAddress,
  instanceAddress
) =>
  contractInstance(instanceAddress)
    .methods.submitEvidence(transactionID, evidence)
    .send({ from: senderAddress });

export const getTransactionIDsByAddress = async (address, instanceAddress) => {
  let transactions = await contractInstance(instanceAddress)
    .methods.getTransactionIDsByAddress(address)
    .call();
  return transactions;
};
