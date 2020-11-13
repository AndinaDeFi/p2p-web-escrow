import Mime from "mime-types";
import React from "react";

class Evidence extends React.Component {
  constructor(props) {
    super(props);
    this.ipfsGateway = "https://ipfs.kleros.io";
  }
  typeToIcon = (type) => {
    switch (type) {
      case "video":
        return "video.svg";
      case "image":
        return "image.svg";
      default:
        return "text.svg";
    }
  };

  render() {
    const { fileURI } = this.props;

    return (
      <a
        href={this.ipfsGateway + fileURI}
        rel="noopener noreferrer"
        target="_blank"
      >
        {" "}
        <img
          alt=""
          className="m-1"
          src={this.typeToIcon(
            Mime.lookup(fileURI.split(".")[1]).toString().split("/")[0]
          )}
        />
      </a>
    );
  }
}

export default Evidence;
