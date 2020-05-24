import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { Card } from "../styled";
import { WalletContext } from "../../providers/wallet";
import ERC20 from "dalp-core/artifacts/ERC20.json";
import { zeroAddress } from "../../Constants/ethereum";

const StyledRow = styled.div`
  border-bottom: 1px solid rgba(0,0,0,.1);
  margin-bottom: 20px;

  padding-bottom: 10px;
  :last-child {
    border-bottom: none;
    margin-bottom: 0px;
  }
`;

const PoolAllocation = () => {

  const { wallet, dalpManager } = useContext(WalletContext);

  const [token0, setToken0] = useState(zeroAddress);
  const [token1, setToken1] = useState(zeroAddress);

  const defaultTokenData = {
    "balance": 0,
    "symbol": "ETH",
    "name": "Ether"
  };

  const [token0Data, setToken0Data] = useState(defaultTokenData);
  const [token1Data, setToken1Data] = useState(defaultTokenData);

  useEffect(() => {
    if (dalpManager) {
      dalpManager.methods.getActiveUniswapV2Tokens().call().then(({ 0: token0, 1: token1 }) => {
        setToken0(token0);
        setToken1(token1);
      });
    }
  }, [dalpManager]);

  useEffect(() => {
    if (token0 !== zeroAddress && token1 !== zeroAddress) {
      dalpManager.methods.getDalpProportionalReserves().call()
        .then(({0: reserve0, 1: reserve1}) => {
          const token0Contract = new wallet.eth.Contract(ERC20.abi, token0);
          Promise.all([
            token0Contract.methods.symbol().call(),
            token0Contract.methods.name().call()
          ]).then(([balance0, symbol0, name0]) => {
            setToken0Data({
              "balance": reserve0,
              "symbol": symbol0,
              "name": name0
            });
          });

          const token1Contract = new wallet.eth.Contract(ERC20.abi, token1);
          Promise.all([
            token1Contract.methods.symbol().call(),
            token1Contract.methods.name().call()
          ]).then(([balance1, symbol1, name1]) => {
            setToken1Data({
              "balance": reserve1,
              "symbol": symbol1,
              "name": name1
            });
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token0, token1]);

  return (
    <React.Fragment>
      <h5 className="card-title">Pool Allocation</h5>
      <Card>
        <div className="card-body">
          {
            token0 === zeroAddress && token1 === zeroAddress
              ? (
                <StyledRow className="row">
                  <div className="col-md-12 d-flex align-items-center justify-content-between">
                    <h2>DALP is not invested in a pool</h2>
                  </div>
                </StyledRow>
              )
              : (
                  <>
                    <StyledRow key="token0" className="row">
                      <div className="col-md-12 d-flex align-items-center justify-content-between">
                        <h2>{token0Data.symbol}</h2>
                        <h3>{wallet.utils.fromWei(token0Data.balance.toString())}</h3>
                      </div>
                    </StyledRow>
                    <StyledRow key="token1" className="row">
                      <div className="col-md-12 d-flex align-items-center justify-content-between">
                        <h2>{token1Data.symbol}</h2>
                        <h3>{wallet.utils.fromWei(token1Data.balance.toString())}</h3>
                      </div>
                    </StyledRow>
                  </>
              )
          }
        </div>
      </Card>
    </React.Fragment>
  )

};

export default PoolAllocation;
