import React from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Evidence from "./evidence";

import Archon from "@kleros/archon";
import * as MultipleArbitrableTransactionWithFee from "./ethereum/multiple-arbitrable-transaction-with-fee";

class Evidences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arbitratorAddress: this.props.arbitratorAddress,
      arbitrableAddress: this.props.arbitrableAddress,
      disputeID: this.props.disputeID,
      payer: this.props.payer,
      payee: this.props.payee,
      payerEvidence: [],
      payeeEvidence: [],
      archon: null,
      metaevidence: null,
    };
  }

  async componentDidMount() {
    this.setState({
      archon: new Archon(window.web3.currentProvider, "https://ipfs.kleros.io"),
    });
  }

  async componentDidUpdate(prevProps) {
    let changed = false;
    if (this.props.arbitratorAddress !== prevProps.arbitratorAddress) {
      this.setState({ arbitratorAddress: this.props.arbitratorAddress });
      changed = true;
    }
    if (this.props.arbitrableAddress !== prevProps.arbitrableAddress) {
      this.setState({ arbitrableAddress: this.props.arbitrableAddress });
      changed = true;
    }
    if (this.props.disputeID !== prevProps.disputeID) {
      this.setState({ disputeID: this.props.disputeID });
      changed = true;
    }
    if (this.props.payer !== prevProps.payer) {
      this.setState({ payer: this.props.payer });
      changed = true;
    }
    if (this.props.payee !== prevProps.payee) {
      this.setState({ payee: this.props.payee });
      changed = true;
    }
    if (
      changed &&
      this.props.disputeID !== null &&
      this.props.arbitrableAddress !== "Unassigned" &&
      this.props.arbitratorAddress !== "Unassigned"
    )
      this.getEvidences();
  }

  getEvidences = async () => {
    console.log("Getting evidence");
    const {
      archon,
      arbitratorAddress,
      arbitrableAddress,
      disputeID,
    } = this.state;
    const arbitrable = MultipleArbitrableTransactionWithFee.contractInstance(
      arbitrableAddress
    );
    const filter = { _arbitrator: arbitratorAddress, _disputeID: disputeID };
    const options = { filter, fromBlock: 0 };

    this.setState({
      payerEvidence: [],
      payeeEvidence: [],
    });

    arbitrable.getPastEvents("Dispute", options).then((events) =>
      events.map((event) =>
        archon.arbitrable
          .getMetaEvidence(
            arbitrableAddress,
            event.returnValues._metaEvidenceID
          )
          .then((x) => this.fetchAndAssignMetaevidence(x))
          .then(
            archon.arbitrable
              .getEvidence(
                arbitrableAddress,
                arbitratorAddress,
                event.returnValues._metaEvidenceID
              )
              .then((evidences) => {
                evidences.map((evidence) =>
                  this.fetchAndAssignEvidence(evidence)
                );
              })
          )
      )
    );
  };

  fetchAndAssignEvidence = async (evidence) => {
    const { payer, payee } = this.state;

    const submitter = evidence.submittedBy;

    if (submitter === payer) {
      this.setState((state) => ({
        payerEvidence: [...state.payerEvidence, evidence],
      }));
    } else if (submitter === payee) {
      this.setState((state) => ({
        payeeEvidence: [...state.payeeEvidence, evidence],
      }));
    }
  };

  fetchAndAssignMetaevidence = async (metaevidence) => {
    this.setState({ metaevidence });
  };

  evidences = (evidences) => {
    const items = evidences.map((item) => (
      <Evidence
        description={item && item.evidenceJSON.description}
        evidenceJSONValid={item && item.evidenceJSONValid}
        fileHash={item && item.evidenceJSON.fileHash}
        fileURI={item && item.evidenceJSON.fileURI}
        key={item && item.evidenceJSON.name + item.evidenceJSON.fileURI}
        name={item && item.evidenceJSON.name}
      />
    ));

    return items;
  };

  render() {
    const { payerEvidence, payeeEvidence } = this.state;

    return (
      <Container>
        <h3>Evidence</h3>
        <Row>
          <Card className="my-4 text-center " style={{ width: "auto" }}>
            <Card.Body>
              <Card.Title>Payer's evidence</Card.Title>
              {payerEvidence === [] ? (
                "No evidence submitted."
              ) : (
                <Row style={{ justifyContent: "center" }}>
                  {this.evidences(payerEvidence)}
                </Row>
              )}
            </Card.Body>
          </Card>
          <Card className="my-4 text-center " style={{ width: "auto" }}>
            <Card.Body>
              <Card.Title>Payee's evidence</Card.Title>
              {payeeEvidence === [] ? (
                "No evidence submitted."
              ) : (
                <Row style={{ justifyContent: "center" }}>
                  {this.evidences(payeeEvidence)}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Row>
      </Container>
    );
  }
}

export default Evidences;
