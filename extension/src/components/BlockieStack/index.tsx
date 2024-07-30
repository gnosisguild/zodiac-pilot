import React from 'react';
import classNames from 'classnames';
import Blockie from '../Blockie';

import classes from './style.module.css';

interface BlockieStackProps {
  addresses: string[];
  className?: string;
}

const BlockieStack: React.FC<BlockieStackProps> = ({ addresses, className }) => {
  return (
    <div className={classNames(classes.stackContainer, className)}>
      {addresses.map((address) => (
        <div key={address} className={classes.blockieWrapper}>
          <Blockie address={address} className={classes.blockies} />
        </div>
      ))}
    </div>
  );
}

export default BlockieStack;