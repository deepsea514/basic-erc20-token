import React from "react";
import { BigNumber, ethers } from "ethers";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

import { BRIGHTTOKEN } from "../typechain/BRIGHTTOKEN";
import { ERC20 } from "../typechain/ERC20";
import { PresaleFactory } from "../typechain/PresaleFactory";

import TokenArtifact from "../artifacts/contracts/BRIGHTTOKEN.sol/BRIGHTTOKEN.json";
import FactoryArtifact from "../artifacts/contracts/PresaleFactory.sol/PresaleFactory.json";
import ERC20Artifact from "../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";
const TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS;
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS;
const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;

const RINKEBY_NETWORK_ID = '4';

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

type TokenInfo = {
    name: string;
    symbol: string;
    decimals: number;
    price: BigNumber;
}

type DappStatus = {
    tokenData: TokenInfo | null;
    account: string | null;
    balance: BigNumber | null;
    txBeingSent: string | null;
    transactionError: string | null;
    networkError: string | null;
    isInTransaction: boolean;
    _provider?: ethers.providers.Web3Provider | undefined;
    _token?: BRIGHTTOKEN | undefined;
    _factory?: PresaleFactory | undefined;
    _usdc?: ERC20 | undefined;
    _pollDataInterval?: NodeJS.Timer | undefined;
}

const initialState: DappStatus = {
    tokenData: null,
    account: null,
    balance: null,
    txBeingSent: null,
    transactionError: null,
    networkError: null,
    isInTransaction: false
}

export class Dapp extends React.Component<any, DappStatus> {
    constructor(props: any) {
        super(props);

        this.state = initialState;
    }

    componentDidMount() {
        this._connectWallet();
    }

    componentWillUnmount() {
        this._stopPollingData();
    }

    _connectWallet = async () => {
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (!this._checkNetwork()) {
            return;
        }

        await this._initialize(account);

        window.ethereum.on("accountsChanged", (accounts: any) => {
            if (Array.isArray(accounts)) {
                const new_account = accounts[0];
                this._stopPollingData();
                if (new_account === undefined) {
                    return this._resetState();
                }
                this._initialize(new_account!);
            }

        });

        window.ethereum.on("chainChanged", () => {
            this._stopPollingData();
            this._resetState();
        });
    }

    _initialize = async (account: string) => {
        this.setState({ account: account });

        await this._initializeEthers();
        this._getTokenData();
        await this._startPollingData();
    }

    _initializeEthers = async () => {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);

        const _token = new ethers.Contract(
            TOKEN_ADDRESS!,
            TokenArtifact.abi,
            _provider.getSigner(0)
        ) as BRIGHTTOKEN;

        const _factory = new ethers.Contract(
            FACTORY_ADDRESS!,
            FactoryArtifact.abi,
            _provider.getSigner(0)
        ) as PresaleFactory;

        const _usdc = new ethers.Contract(
            USDC_ADDRESS!,
            ERC20Artifact.abi,
            _provider.getSigner(0)
        ) as ERC20;

        await this.setState({
            _provider: _provider,
            _token: _token,
            _factory: _factory,
            _usdc: _usdc
        });
    }

    _startPollingData = async () => {
        const _pollDataInterval = setInterval(() => this._updateBalance(), 1000);
        await this.setState({ _pollDataInterval: _pollDataInterval });
        this._updateBalance();
    }

    _stopPollingData = () => {
        const { _pollDataInterval } = this.state;
        if (_pollDataInterval) clearInterval(_pollDataInterval);
        this.setState({ _pollDataInterval: undefined });
    }

    _getTokenData = async () => {
        const { _token, _factory } = this.state;
        const name = await _token!.name();
        const symbol = await _token!.symbol();
        const decimals = await _token!.decimals();
        const price = await _factory!.getPresalePrice();

        this.setState({
            tokenData: {
                name: name,
                symbol: symbol,
                decimals: Math.pow(10, decimals),
                price: price,
            }
        });
    }

    _updateBalance = async () => {
        const { _token, account } = this.state;
        const balance = await _token!.balanceOf(account!);
        this.setState({ balance });
    }

    _purchaseTokens = async (amount: number) => {
        const { tokenData, _usdc, _factory } = this.state;
        this.setState({ isInTransaction: true });
        try {
            this._dismissTransactionError();

            const totalPrice = tokenData!.price.mul(amount / 10);
            await _usdc!.approve(FACTORY_ADDRESS!, totalPrice);

            const tx = await _factory?.purchaseToken(amount);

            this.setState({ txBeingSent: tx!.hash });

            const receipt = await tx!.wait();

            if (receipt.status === 0) {
                throw new Error("Transaction failed");
            }

            await this._updateBalance();
        } catch (error: any) {
            if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
                return;
            }

            console.error(error);
            this.setState({ transactionError: error });
        } finally {
            this.setState({ txBeingSent: null, isInTransaction: false });
        }
    }

    _dismissTransactionError = () => {
        this.setState({ transactionError: null });
    }

    _dismissNetworkError = () => {
        this.setState({ networkError: null });
    }

    _getRpcErrorMessage = (error: any) => {
        if (error.data) {
            return error.data.message;
        }

        return error.message;
    }

    _resetState = () => {
        this.setState(initialState);
    }

    _checkNetwork = () => {
        if (window.ethereum.networkVersion === RINKEBY_NETWORK_ID) {
            return true;
        }

        this.setState({
            networkError: 'Please connect Metamask to Localhost:8545'
        });

        return false;
    }

    render() {
        const {
            account, networkError, tokenData, balance, txBeingSent, transactionError,
            isInTransaction
        } = this.state;

        if (window.ethereum === undefined) {
            return <NoWalletDetected />;
        }

        if (!account) {
            return (
                <ConnectWallet
                    connectWallet={this._connectWallet}
                    networkError={networkError!}
                    dismiss={this._dismissNetworkError}
                />
            );
        }

        if (!tokenData || !balance) {
            return <Loading />;
        }

        return (
            <div className="container p-4">
                <div className="row">
                    <div className="col-12">
                        <h1>
                            {tokenData.name} ({tokenData.symbol})
                        </h1>
                        <p>
                            Welcome <b>{account}</b>, you have{" "}
                            <b>
                                {balance.div(tokenData.decimals).toString()} {tokenData.symbol}
                            </b>
                            .
                        </p>
                    </div>
                </div>

                <hr />

                <div className="row">
                    <div className="col-12">

                        {txBeingSent && (
                            <WaitingForTransactionMessage txHash={txBeingSent} />
                        )}

                        {transactionError && (
                            <TransactionErrorMessage
                                message={this._getRpcErrorMessage(transactionError)}
                                dismiss={this._dismissTransactionError}
                            />
                        )}
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <Transfer purchaseTokens={this._purchaseTokens}
                            tokenSymbol={tokenData.symbol}
                            isInTransaction={isInTransaction}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
