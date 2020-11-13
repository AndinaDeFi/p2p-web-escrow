// import ERC20Mock from "./ERC20Mock.json";
import DocToken from "./DocToken.json";
import web3 from "./web3";

export const contractInstance = (address) =>
  new web3.eth.Contract(DocToken.abi, address);
// new web3.eth.Contract(ERC20Mock.abi, address);

export const allowance = async (instanceAddress, owner, spender) =>
  await contractInstance(instanceAddress)
    .methods.allowance(owner, spender)
    .call({ from: owner });

export const approve = async (instanceAddress, spender, value, owner) =>
  await contractInstance(instanceAddress)
    .methods.approve(spender, value)
    .send({ from: owner });
