import React, { FC } from "react";
import { NetworkErrorMessage } from "./NetworkErrorMessage";

type ConnectWalletProps = {
    connectWallet: () => void;
    networkError: string;
    dismiss: () => void;
}

export const ConnectWallet: FC<ConnectWalletProps> = ({ connectWallet, networkError, dismiss }) => {
    return (
        <div className="container">
            <div className="row justify-content-md-center">
                <div className="col-12 text-center">
                    {networkError && (
                        <NetworkErrorMessage
                            message={networkError}
                            dismiss={dismiss}
                        />
                    )}
                </div>
                <div className="col-6 p-4 text-center">
                    <p>Please connect to your wallet.</p>
                    <button
                        className="btn btn-warning"
                        type="button"
                        onClick={connectWallet}
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        </div>
    );
}
