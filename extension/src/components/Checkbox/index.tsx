import React, { useState } from 'react';
import classnames from 'classnames';
import classes from './styles.module.css';

const Checkbox: React.FC<{ checked?: boolean }> = ({ checked = false }) => {
  const [isChecked, setIsChecked] = useState<boolean>(checked);

  const handleChange = () => {
    setIsChecked(prevState => !prevState);
  };

  return (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={handleChange}
      className={classnames(classes.checkbox, { [classes.checkboxChecked]: isChecked })}
    />
  );
};

export default Checkbox;
