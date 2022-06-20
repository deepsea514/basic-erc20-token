import React, { FC, useState } from "react";

type TransferProps = {
    purchaseTokens: (amount: number) => void;
    tokenSymbol: string;
}

export const Transfer: FC<TransferProps> = ({ purchaseTokens, tokenSymbol }) => {
    const [amount, setAmount] = useState('10');

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
                    <label>Amount of {tokenSymbol}</label>
                    <input
                        className="form-control"
                        type="number"
                        step="10"
                        name="amount"
                        min={10}
                        placeholder="10"
                        value={amount}
                        onChange={(evt) => setAmount(evt.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <button className="btn btn-primary" type="submit" >Buy Token</button>
                </div>
            </form >
        </div >
    );
}
