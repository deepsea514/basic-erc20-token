import React, { FC } from "react";

type WaitingForTransactionMessageProps = {
    txHash: string;
}

export const WaitingForTransactionMessage: FC<WaitingForTransactionMessageProps> = ({ txHash }) => {
    return (
        <div className="alert alert-info" role="alert">
            Waiting for transaction <strong>{txHash}</strong> to be mined
        </div>
    );
}
