# P2P Web Escrow

This project was conceibed for Kleros Hackathon 2020, by a group of Open Justice lovers that also love (and build) an app called Defiant.

Defiant is a non-custodial wallet that was born with a P2P marketplace as its very heart. Nowadays it has plenty more features, but the P2P is an important one for us. But many of our users are still reluctant to use the P2P. They are missing something. Entering: Kleros Escrow.

## An Escrow for a P2P Marketplace

For quite some time already, we've been lookin for a way to secure our users' experience while selling or buying through the P2P marketplace. When we heard of Kleros Escrow, we knew it was ideal for this matter.

We have been working on it for some time. In case you want to see how we envision it, you can check it out: https://docs.google.com/presentation/d/1ue7UNHD0aj5qg4wW-5qiRvNxQTkoAp0JV2ABlJy4uf8/edit?usp=sharing. Of course it just serves to understand the possible user journeys within the app.

## About web app

This web app offers a simple way of interacting with Kleros Escrow system, from the web, using Metamask or Nifty wallet. What a user can do with it is:

- Create transactions in native tokens (ETH, RBTC...) of ERC20 tokens in order to send those funds to a payee, who is supposed to give you something in return. What the payee gives you may be fiat money (as in a P2P marketplace like Defiant's), goods, services, etc.
- Interact with a transaction in which you are either the payer or the payee.
- Use the app to find the transactions you are involved in.
- Let the app explain the situation. So you can always know and understand what is happening with your transaction.
- Immediately know what party you are thanks to the graphic UI.
- In case of disputes, submit evidence and see what evidence the other party submitted.
- You can also use the app to deploy your own escrow contracts.

The web app may very well be used for general purpose, by both parties, to fulfill entire transactions of various kinds. But from the beginning we envisioned it as a complement to Defiant P2P, once we have (hopefully) integrated it. In this way, a user can interact with a transaction using both Defiant and this web app.

## Implementation comments

We used both **MultipleArbitrableTransactionWithFee** and **MultipleArbitrableTokenTransactionWithFee** contracts as escrow, depending on the type of token being transacted.

In the case of using ERC20, the UI is able to approve the intended amount of tokens necessary for the use of the escrow.

As we plan to deploy such system in both Ethereum and RSK networks, you may find the terms "native token", "ETH" or "RBTC". The correct one will be used in each case.

## Running the web app

### Arbitrator

In order to experience the whole user journey, you will need an arbitrator. We used the Centralized Arbitrator provided by Kleros (https://github.com/kleros/centralized-arbitrator-dashboard). You can clone it, install the dependencies and use it right away.

With it, you can run it and deploy a centralized arbitrator contract, which is necessary for the Escrow web app. You only need to set up the arbitration price users will need to pay in order to reclaim a transaction. Take into account that the address with which you deploy the arbitrator contract will have ruling capabilities, i.e. will be able to decide who wins a dispute.

Once you have deployed the arbitrator, check _app.js_ for the arbitrator address. In case it is not the same, please replace the address with the one of the arbitrator you just deployed _(to-do if we had some more time)_.

### ERC20

You will also need one ERC20 token contract with which to interact. In order to deploy one, you can use _truffle_:

```
truffle console
```

Ans in truffle console:

```
erc20 = await ERC20Mock.new(accounts[0], 1000000)
addr = erc20.address
```

Then, copy the value of _addr_ as a value of _erc20_ in app.js:30 (TO-DO: Automatize in case of extra time).

### Escrow web app (what you are here for)

For the P2P Web escrow app:

- Clone this repo.
- Install the dependencies with _yarn_ or _npm_.
- Run a _ganache_ or _ganache-cli_ instance.
- Run `yarn start`.

In the browser:

- Open Metamask or Nifty wallet.
- Make sure you got it configured to use your local Ganache instance.
- If you are running it for the first time, you can deploy escrows of the type you need (either for native tokens, or for ERC20 tokens). This would be something you would not need to do as a user, normally. These escrow contracts would already be deployed.
- If you have already deployed them, you can input the corresponding address in the left side panel, in order to interact with that escrow.
- If you have already created a transaction, you can use the "Find my transactions" button to get your transactions on that escrow, both you being the payer or the payee.
- When you are creating a transaction, you will need to input:
  - The token you want to utilize (native or ERC20).
  - The transaction value (tokens for ERC20, weis for native).
  - Payee's address (in development, you may want to use another address of yours).
  - A title and a description for the transaction. What should you receive in exchange?
- Once created, you will be able to interact with the the escrow regardin your transaction.
  - As a payer, you may order the escrow to release the funds to the payee, or reclaim them.
  - As a payee, you may send the funds back to the payer if you are not able to fulfill the deal. Or you can reclaim if the payer won't release the funds.
  - If a dispute is raised, you can also submit evidence and check the status of the dispute.

### User journeys

A transaction may go different ways depending on how the parties act. Please use this mind map to get a view of all possible user journeys: https://whimsical.com/escrow-web-9mDFFjwYfPkwVpYNgodPnE (you will see an old UI. TO-DO: Do a new one with the new interfaces)

# UI

Part of our team devoted quite some time to re-think once and again how to make it as intuitive as possible to the user to understand how such an escrow system works. A large part of what we learnt during the development of this process is related to this understanding.

Due to time being so tyrant in these events, we could not apply all of the designed UI to the web. You can find the final mockup in final-mockup.pdf. Of course this could be largely improved as well.

# Why we want to get this prize

Because we've been building Defiant as a solution to real people problems for more than a year already, using only our own funds and some grants we've been awarded. So we would use the prize entirely to afford the integration of Kleros Escrow to our P2P marketplace, which is one of the features that both ourselves and our users have been expecting and asking for during months.

Anyway, it was a nice experience participating, we learnt a lot, and we will try to integrate the Escrow feature nonetheless. So kudos to all and thanks for such enriching event!
