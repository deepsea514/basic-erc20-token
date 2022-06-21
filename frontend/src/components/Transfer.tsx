import React, { FC, useState } from "react";

type TransferProps = {
    purchaseTokens: (amount: number) => void;
    tokenSymbol: string;
    isInTransaction: boolean;
}

export const Transfer: FC<TransferProps> = ({ purchaseTokens, tokenSymbol, isInTransaction }) => {
    const [amount, setAmount] = useState('1');

    return (
        <div>
            <h4>Purchase {tokenSymbol} Token</h4>
            <form onSubmit={(event) => {
                event.preventDefault();
                if (amount) {
                    purchaseTokens(Number(amount));
                }
            }}>
                <div className="form-group">
                    <label>Amount of Ticket(10 {tokenSymbol} Per Ticket)</label>
                    <input
                        className="form-control"
                        type="number"
                        step="1"
                        name="amount"
                        min={1}
                        placeholder="1"
                        value={amount}
                        onChange={(evt) => setAmount(evt.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <button className="btn btn-primary"
                        type="submit"
                        disabled={isInTransaction}>Buy Ticket</button>
                </div>
            </form >
        </div >
    );
}
