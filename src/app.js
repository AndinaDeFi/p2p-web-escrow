import React from "react";
import web3 from "./ethereum/web3";
import Ipfs from "ipfs-http-client";
import ipfsPublish from "./ipfs-publish";
import generateMetaevidence from "./ethereum/generate-meta-evidence";

import * as MultipleArbitrableTransactionWithFee from "./ethereum/multiple-arbitrable-transaction-with-fee";
import * as MultipleArbitrableTokenTransactionWithFee from "./ethereum/multiple-arbitrable-token-transaction-with-fee";

// import TransactionEscrow from "./ethereum/MultipleArbitrableTransactionWithFee.json";
// import TokenTransactionEscrow from "./ethereum/MultipleArbitrableTokenTransactionWithFee.json";

import Container from "react-bootstrap/Container";
// import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import NewTransaction from "./new-transaction.js";
import Interact from "./interact.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.tokenAddresses = {
      erc20: "0xcb46c0ddc60d18efeb0e586c17af6ea36452dae0",
    };
    this.state = {
      // Accounts
      masterDeployer: "0xc5A13C31E46B481067321A1a4E776FD84F8190b2",
      defaultPayee: "0x3623e33DE3Aa9cc60b300251fbDFA4ac29Fe1CFD",
      feeRecipient: "0xef5585851da91ab525839F6E8a7D4600Db77ea0c",
      arbitratorAddress: "0xB304Fe074073Ec2DC4adA34D066D0dB968BBeCDd".toLowerCase(),
      transacEscrowAddress: "0xc3b5fA1aF1bCF1A9925d622E5FAfcA313089d03e".toLowerCase(),
      tokenEscrowAddress: "0x9aA0610415521833Aaf95EB6dcd5298c3EdE5496".toLowerCase(), // tokenEscrowAddress: "0x01965a722CB883Dd2516BBFFF21868D641bF2CBD", // Deployed in Testnet // transacEscrowAddress: "0xc3b5fa1af1bcf1a9925d622e5fafca313089d03e",
      //
      activeAddress: "0x0000000000000000000000000000000000000000",
      transacEscrowTransactions: [],
      tokenEscrowTransactions: [],
      feeTimeout: 30,
      // feeTimeout: 3 * 60 * 60,
      feeRecipientBasisPoint: 500,
      timeoutPayment: 100,
      lastTransactionID: null,
      arbitratorExtraData: web3.utils.utf8ToHex(0),
      coin: "rbtc",
    };
    this.ipfs = new Ipfs({
      host: "ipfs.kleros.io",
      port: 5001,
      protocol: "https",
    });

    // window.MultArbContract = TransactionEscrow;
  }

  coinChange = (coin) => {
    this.setState({ coin });
  };

  newTransaction = async (
    amount,
    payee,
    title,
    description,
    tokenAddress = null
  ) => {
    const {
      activeAddress,
      transacEscrowAddress,
      tokenEscrowAddress,
      timeoutPayment,
    } = this.state;

    let metaevidence = generateMetaevidence(
      web3.utils.toChecksumAddress(activeAddress),
      web3.utils.toChecksumAddress(payee),
      amount,
      title,
      description
    );
    const enc = new TextEncoder();
    const ipfsHashMetaEvidenceObj = await ipfsPublish(
      "metaEvidence.json",
      enc.encode(JSON.stringify(metaevidence))
    );
    let result;
    if (tokenAddress === null) {
      result = await MultipleArbitrableTransactionWithFee.createTransaction(
        activeAddress,
        amount,
        transacEscrowAddress,
        timeoutPayment,
        payee,
        "/ipfs/" +
          ipfsHashMetaEvidenceObj[1]["hash"] +
          ipfsHashMetaEvidenceObj[0]["path"]
      );
    } else {
      result = await MultipleArbitrableTokenTransactionWithFee.createTransaction(
        activeAddress,
        amount,
        tokenAddress,
        tokenEscrowAddress,
        timeoutPayment,
        payee,
        "/ipfs/" +
          ipfsHashMetaEvidenceObj[1]["hash"] +
          ipfsHashMetaEvidenceObj[0]["path"]
      );
    }
    this.setState({
      lastTransactionID:
        result.events.MetaEvidence.returnValues._metaEvidenceID,
    });
    console.log(
      `Transaction created: ${result.transactionHash} and state updated`
    );
  };

  getUserTransEscrowTransactions = async () => {
    const { activeAddress, transacEscrowAddress } = this.state;
    let transactions = await MultipleArbitrableTransactionWithFee.getTransactionIDsByAddress(
      activeAddress,
      transacEscrowAddress
    );
    this.setState({ transacEscrowTransactions: transactions });
  };

  getUserTokenEscrowTransactions = async () => {
    const { activeAddress, tokenEscrowAddress } = this.state;
    let transactions = await MultipleArbitrableTokenTransactionWithFee.getTransactionIDsByAddress(
      activeAddress,
      tokenEscrowAddress
    );
    this.setState({ tokenEscrowTransactions: transactions });
  };

  onTransacEscrowAddressChange = async (e) => {
    const targetMultArbAddress = e.target.value.trim();
    try {
      this.setState({
        transacEscrowAddress: (
          await MultipleArbitrableTransactionWithFee.contractInstance(
            targetMultArbAddress
          )
        )._address,
      });
      console.log(`Transaction Escrow address: ${targetMultArbAddress}`);
      this.getUserTransEscrowTransactions();
    } catch (e) {
      alert("Failing. Deploy new one instead.");
      this.setState({ transacEscrowAddress: "ERROR" });
    }
  };

  onTokenEscrowAddressChange = async (e) => {
    const targetMultArbAddress = e.target.value.trim();
    try {
      this.setState({
        tokenEscrowAddress: (
          await MultipleArbitrableTokenTransactionWithFee.contractInstance(
            targetMultArbAddress
          )
        )._address,
      });
      console.log(`Token Escrow address: ${targetMultArbAddress}`);
    } catch (e) {
      alert("Failing. Deploy new one instead.");
      this.setState({ tokenEscrowAddress: "ERROR" });
    }
  };

  onDeployTransacEscrowClick = async (e) => {
    e.preventDefault();
    const {
      activeAddress,
      arbitratorAddress,
      arbitratorExtraData,
      feeRecipient,
      feeRecipientBasisPoint,
      feeTimeout,
    } = this.state;
    const multipleArbitrableInstance = await MultipleArbitrableTransactionWithFee.deploy(
      activeAddress,
      arbitratorAddress,
      arbitratorExtraData,
      feeRecipient,
      feeRecipientBasisPoint,
      feeTimeout
    );
    this.setState({
      transacEscrowAddress: multipleArbitrableInstance._address,
    });
    this.getUserTransEscrowTransactions();
    this.getUserTokenEscrowTransactions();
  };

  onDeployTokenEscrowClick = async (e) => {
    e.preventDefault();
    const {
      activeAddress,
      arbitratorAddress,
      arbitratorExtraData,
      feeRecipient,
      feeRecipientBasisPoint,
      feeTimeout,
    } = this.state;
    const multipleArbitrableInstance = await MultipleArbitrableTokenTransactionWithFee.deploy(
      activeAddress,
      arbitratorAddress,
      arbitratorExtraData,
      feeRecipient,
      feeRecipientBasisPoint,
      feeTimeout
    );
    console.log(`Deployed at ${multipleArbitrableInstance._address}`);
    this.setState({
      tokenEscrowAddress: multipleArbitrableInstance._address,
    });
    this.getUserTokenEscrowTransactions();
  };

  async componentDidMount() {
    if (window.web3 && window.web3.currentProvider.isMetaMask) {
      window.web3.eth.getAccounts((_, accounts) => {
        this.setState({
          activeAddress: accounts[0],
        });
      });
    } else console.error("MetaMask account not detected :(");

    window.ethereum.on("accountsChanged", (accounts) => {
      this.setState({
        activeAddress: accounts[0],
      });
    });

    this.getUserTransEscrowTransactions();
    this.getUserTokenEscrowTransactions();
  }

  setActiveTransactionID = (e) => {
    e.preventDefault();
    let coin;
    if (e.target.attributes.escrow_type.value === "transaction") coin = "rbtc";
    else coin = "erc20";
    this.setState({ lastTransactionID: e.target.value, coin });
  };

  render() {
    const {
      transacEscrowAddress,
      transacEscrowTransactions,
      tokenEscrowAddress,
      tokenEscrowTransactions,
      lastTransactionID,
      defaultPayee,
      activeAddress,
      coin,
    } = this.state;
    return (
      <Container>
        <Row style={{ marginBottom: "20px" }}>
          <Col>
            <h1 className="text-center my-5">Escrow dapp</h1>{" "}
            <Row>
              <Col>
                <Card className="h-100 my-4 text-center">
                  <Card.Body>
                    <Card.Title>Native token Escrow</Card.Title>
                    <p>
                      <Button
                        type="submit"
                        variant="outline-dark"
                        onClick={this.onDeployTransacEscrowClick}
                      >
                        Deploy new contract{" "}
                      </Button>{" "}
                    </p>{" "}
                    <Form.Group controlId="transac-escrow-address">
                      <Form.Control
                        className="text-center"
                        as="input"
                        rows="1"
                        value={transacEscrowAddress}
                        onChange={this.onTransacEscrowAddressChange}
                      />
                    </Form.Group>
                    <p>
                      <Badge
                        className="m-1"
                        pill
                        variant="info"
                      >{`Deployed at: ${transacEscrowAddress}`}</Badge>
                    </p>
                    <Button
                      type="submit"
                      variant="outline-success"
                      onClick={this.getUserTransEscrowTransactions}
                    >
                      Find my transactions
                    </Button>
                    {transacEscrowTransactions !== null &&
                      transacEscrowTransactions.length > 0 && (
                        <div style={{ marginTop: "1.5rem" }}>
                          <p>Your transactions with this escrow are:</p>
                          {transacEscrowTransactions.map((transac) => (
                            <Button
                              className="mx-2"
                              onClick={this.setActiveTransactionID}
                              value={transac.toString()}
                              escrow_type="transaction"
                              variant="success"
                            >
                              {transac.toString()}
                            </Button>
                          ))}
                        </div>
                      )}
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card className="h-100 my-4 text-center">
                  <Card.Body>
                    <Card.Title>ERC20 Token Escrow</Card.Title>
                    <p>
                      <Button
                        type="submit"
                        variant="outline-dark"
                        onClick={this.onDeployTokenEscrowClick}
                      >
                        Deploy new contract{" "}
                      </Button>{" "}
                    </p>{" "}
                    <Form.Group controlId="token-escrow-address">
                      <Form.Control
                        className="text-center"
                        as="input"
                        rows="1"
                        value={tokenEscrowAddress}
                        onChange={this.onTokenEscrowAddressChange}
                      />
                    </Form.Group>
                    <p>
                      <Badge
                        className="m-1"
                        pill
                        variant="info"
                      >{`Deployed at: ${tokenEscrowAddress}`}</Badge>
                    </p>
                    <Button
                      type="submit"
                      variant="outline-success"
                      onClick={this.getUserTokenEscrowTransactions}
                    >
                      Find my transactions
                    </Button>
                    {tokenEscrowTransactions !== null &&
                      tokenEscrowTransactions.length > 0 && (
                        <div style={{ marginTop: "1.5rem" }}>
                          <p>Your transactions with this escrow are:</p>
                          {tokenEscrowTransactions.map((transac) => (
                            <Button
                              className="mx-2"
                              onClick={this.setActiveTransactionID}
                              value={transac.toString()}
                              escrow_type="token"
                              variant="success"
                            >
                              {transac.toString()}
                            </Button>
                          ))}
                        </div>
                      )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>{" "}
        </Row>{" "}
        <Row>
          <Col>
            <NewTransaction
              newTransactionCallback={this.newTransaction}
              coinChangeCallback={this.coinChange}
              defaultPayee={defaultPayee}
              activeAddress={activeAddress}
              tokenEscrowAddress={tokenEscrowAddress}
              tokenAddresses={this.tokenAddresses}
            />{" "}
          </Col>{" "}
          <Col>
            <Interact
              activeAddress={activeAddress}
              tokenEscrowAddress={tokenEscrowAddress}
              transacEscrowAddress={transacEscrowAddress}
              transactionID={lastTransactionID}
              tokenAddresses={this.tokenAddresses}
              coin={coin}
            />{" "}
          </Col>{" "}
        </Row>{" "}
      </Container>
    );
  }
}

export default App;
