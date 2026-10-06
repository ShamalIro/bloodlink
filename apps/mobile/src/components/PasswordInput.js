import React, { forwardRef, useState } from 'react';
import FormInput from './FormInput';
import IconButton from './IconButton';

const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <FormInput
      ref={ref}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      rightElement={(
        <IconButton
          icon={visible ? 'eye-off-outline' : 'eye-outline'}
          variant="ghost"
          onPress={() => setVisible((value) => !value)}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        />
      )}
      {...props}
    />
  );
});

export default PasswordInput;
