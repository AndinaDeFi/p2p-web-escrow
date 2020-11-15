import React from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import * as ERC20 from "./ethereum/erc20";
// import ERC20Mock from "./ethereum/ERC20Mock.json";

class NewTransaction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeAddress: this.props.activeAddress,
      tokenEscrowAddress: this.props.tokenEscrowAddress,
      amount: "",
      // payee: "",
      title: "",
      description: "",
      coin: "rbtc",
      allowedAmount: 0,
      amountToAllow: 0,
      tokenAddress: null,
    };
    window.ERC20 = ERC20;
  }

  async componentDidUpdate(prevProps) {
    if (this.props.activeAddress !== prevProps.activeAddress) {
      this.setState({ activeAddress: this.props.activeAddress });
    }
    if (this.props.tokenEscrowAddress !== prevProps.tokenEscrowAddress) {
      this.setState({ tokenEscrowAddress: this.props.tokenEscrowAddress });
    }
  }

  updateApprovedAmount = async (coin, tokenAddress) => {
    const { activeAddress, tokenEscrowAddress } = this.state;
    let allowedAmount;
    if (coin === "rbtc") {
      allowedAmount = 0;
    } else {
      allowedAmount = await ERC20.allowance(
        tokenAddress,
        activeAddress,
        tokenEscrowAddress
      );
    }
    this.setState({ allowedAmount });
  };

  onCoinChange = async (e) => {
    const coin = e.target.value;
    let tokenAddress;
    if (coin === "rbtc") {
      tokenAddress = null;
    } else {
      tokenAddress = this.props.tokenAddresses.erc20;
    }
    this.setState({ coin, tokenAddress });
    this.updateApprovedAmount(coin, tokenAddress);
    this.props.coinChangeCallback(coin);
  };

  onAmountChange = (e) => {
    this.setState({ amount: e.target.value });
  };

  onPayeeChange = (e) => {
    this.setState({ payee: e.target.value });
  };

  onTitleChange = (e) => {
    this.setState({ title: e.target.value });
  };

  onDescriptionChange = (e) => {
    this.setState({ description: e.target.value });
  };

  onDeployButtonClick = async (e) => {
    e.preventDefault();
    const { amount, payee, title, description, tokenAddress } = this.state;
    await this.props.newTransactionCallback(
      amount,
      payee,
      title,
      description,
      tokenAddress
    );
  };

  onAmountToApproveChange = (e) => {
    this.setState({ amountToAllow: e.target.value });
  };

  onApproveButtonClick = async (e) => {
    e.preventDefault();
    const {
      amountToAllow,
      coin,
      tokenEscrowAddress,
      activeAddress,
      tokenAddress,
    } = this.state;
    if (coin === "rbtc") {
      console.log("Impossible to approve for Native");
      return;
    }
    await ERC20.approve(
      tokenAddress,
      tokenEscrowAddress,
      amountToAllow,
      activeAddress
    );
    this.updateApprovedAmount(coin, tokenAddress);
  };

  render() {
    const {
      amount,
      payee,
      title,
      description,
      coin,
      allowedAmount,
    } = this.state;

    return (
      <Container className="new-transaction">
        <Card className="my-4 text-center " style={{ width: "auto" }}>
          <Card.Body>
            <Card.Title>New Transaction</Card.Title>
            <Form>
              <Form.Group controlId="coin">
                <Form.Control
                  as="select"
                  defaultValue="rbtc"
                  onChange={this.onCoinChange}
                >
                  <option value="rbtc">Native</option>
                  <option value="erc20">ERC20</option>
                </Form.Control>
              </Form.Group>

              {coin !== "rbtc" && (
                <Card className="text-center my-4 erc20-approve">
                  <Card.Title>
                    {`${allowedAmount} ${coin.toUpperCase()} approved to transfer.`}
                  </Card.Title>
                  <Card.Subtitle>Need to approve more?</Card.Subtitle>
                  <Card.Body>
                    <Form.Group
                      controlId="approve"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Form.Control
                        as="input"
                        rows="1"
                        onChange={this.onAmountToApproveChange}
                        placeholder={"Amount to approve"}
                        label="Amount to approve"
                      />
                      <Button
                        variant="outline-primary"
                        type="button"
                        onClick={this.onApproveButtonClick}
                      >
                        Approve
                      </Button>
                    </Form.Group>
                  </Card.Body>
                </Card>
              )}

              <Form.Group controlId="amount">
                <Form.Control
                  as="input"
                  rows="1"
                  value={amount}
                  onChange={this.onAmountChange}
                  placeholder={"Transaction amount (in weis for Native)"}
                  label="Value"
                />
              </Form.Group>
              <Form.Group controlId="payee">
                <Form.Control
                  as="input"
                  rows="1"
                  value={payee}
                  onChange={this.onPayeeChange}
                  // placeholder={this.props.defaultPayee}
                  placeholder="Payee"
                  label="Payee"
                />
              </Form.Group>
              <Form.Group controlId="title">
                <Form.Control
                  as="input"
                  rows="1"
                  value={title}
                  onChange={this.onTitleChange}
                  placeholder="Transaction title"
                  label="Title"
                />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Control
                  as="input"
                  rows="1"
                  value={description}
                  onChange={this.onDescriptionChange}
                  placeholder={"Describe The Agreement"}
                  label="Description"
                />
              </Form.Group>
              <Button
                variant="primary"
                type="button"
                onClick={this.onDeployButtonClick}
                block
              >
                CREATE TRANSACTION
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default NewTransaction;
