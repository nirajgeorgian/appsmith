import { CommonComponentProps, Classes, lighten, darken } from "./common";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Spinner from "./Spinner";

type ToggleProps = CommonComponentProps & {
  onToggle: (value: boolean) => void;
  value: boolean;
};

const StyledToggle = styled.label<{
  isLoading?: boolean;
  disabled?: boolean;
  value: boolean;
}>`
  position: relative;
  display: block;
  font-weight: ${props => props.theme.typography.p1.fontWeight};
  font-size: ${props => props.theme.typography.p1.fontSize}px;
  line-height: ${props => props.theme.typography.p1.lineHeight}px;
  letter-spacing: ${props => props.theme.typography.p1.letterSpacing}px;
  color: ${props => props.theme.colors.blackShades[7]};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    background-color: ${props =>
      props.isLoading
        ? props.theme.colors.blackShades[3]
        : props.theme.colors.blackShades[4]};
    transition: 0.4s;
    width: 46px;
    height: 23px;
    border-radius: 92px;
  }

  ${props =>
    props.isLoading
      ? `.toggle-spinner {
      position: absolute;
      top: 3px;
      left: 17px;
    }
    .slider:before {
      display: none;
    }`
      : `.slider:before {
      position: absolute;
      content: "";
      height: 19px;
      width: 19px;
      top: 2px;
      left: 2px;
      background-color: ${
        props.disabled && !props.value
          ? lighten(props.theme.colors.tertiary.dark, 16)
          : props.theme.colors.blackShades[9]
      };
      box-shadow: ${
        props.value
          ? "1px 0px 3px rgba(0, 0, 0, 0.16)"
          : "-1px 0px 3px rgba(0, 0, 0, 0.16)"
      };
      opacity: ${props.value ? 1 : 0.9};
      transition: .4s;
      border-radius: 50%;
    }`}

  input:hover + .slider:before {
    opacity: 1;
  }

  input:focus + .slider:before {
    ${props => (props.value ? "opacity: 0.6" : "opacity: 0.7")};
  }

  input:disabled + .slider:before {
    ${props => (props.value ? "opacity: 0.24" : "opacity: 1")};
  }

  input:checked + .slider:before {
    transform: translateX(23px);
  }

  input:checked + .slider {
    background-color: ${props => props.theme.colors.info.main};
  }

  input:hover + .slider,
  input:focus + .slider {
    background-color: ${props =>
      props.value
        ? lighten(props.theme.colors.info.main, 12)
        : lighten(props.theme.colors.blackShades[3], 16)};
  }

  input:disabled + .slider {
    cursor: not-allowed;
    background-color: ${props =>
      props.value && !props.isLoading
        ? darken(props.theme.colors.info.darker, 20)
        : props.theme.colors.tertiary.dark};
  }

  .${Classes.SPINNER} {
    circle {
      stroke: ${props => props.theme.colors.blackShades[6]};
    }
  }
`;

export default function Toggle(props: ToggleProps) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const onChangeHandler = (value: boolean) => {
    setValue(value);
    props.onToggle && props.onToggle(value);
  };

  return (
    <StyledToggle
      isLoading={props.isLoading}
      disabled={props.disabled}
      value={value}
    >
      <input
        type="checkbox"
        checked={value}
        disabled={props.disabled || props.isLoading}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChangeHandler(e.target.checked)
        }
      />
      <span className="slider"></span>
      {props.isLoading ? (
        <div className="toggle-spinner">
          <Spinner />
        </div>
      ) : null}
    </StyledToggle>
  );
}
