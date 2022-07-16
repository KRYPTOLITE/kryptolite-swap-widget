import { createReducer } from "@reduxjs/toolkit";
import { DEFAULT_INPUT_CURRENCY } from "../../config/constants";
import {
  Field,
  replaceSwapState,
  selectCurrency,
  switchCurrencies,
  typeInput,
  updateDerivedPairData,
  updatePairData,
} from "./actions";
import { DerivedPairDataNormalized, PairDataNormalized } from "./types";

export interface SwapState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly pairDataById: Record<string, Record<string, PairDataNormalized>>;
  readonly derivedPairDataById: Record<string, Record<string, DerivedPairDataNormalized>>;
  readonly baseCurrencyId: string;
}

const initialState: SwapState = {
  independentField: Field.INPUT,
  typedValue: "",
  [Field.INPUT]: {
    currencyId: "",
  },
  [Field.OUTPUT]: {
    currencyId: "",
  },
  pairDataById: {},
  derivedPairDataById: {},
  baseCurrencyId: "",
};

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (state, { payload: { typedValue, field, inputCurrencyId, outputCurrencyId, baseCurrencyId } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          independentField: field,
          typedValue,
          pairDataById: state.pairDataById,
          derivedPairDataById: state.derivedPairDataById,
          baseCurrencyId: baseCurrencyId,
        };
      },
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field, baseCurrency } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
      let otherCurrencyId = state[otherField].currencyId;
      if (currencyId !== baseCurrency || otherCurrencyId !== baseCurrency) {
        // the case where we keep the primary token
        otherCurrencyId = baseCurrency;
      }

      if (currencyId === otherCurrencyId && otherCurrencyId === baseCurrency) {
        // the case where we have to swap the order and check if other is default
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: DEFAULT_INPUT_CURRENCY },
        };
      } else if (currencyId === otherCurrencyId && otherCurrencyId !== baseCurrency) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: otherCurrencyId },
        };
      }

      // the normal case
      return {
        ...state,
        [field]: { currencyId },
        [otherField]: { currencyId: otherCurrencyId },
      };
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      };
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      };
    })
    .addCase(updatePairData, (state, { payload: { pairData, pairId, timeWindow } }) => {
      if (!state.pairDataById[pairId]) {
        state.pairDataById[pairId] = {};
      }
      state.pairDataById[pairId][timeWindow] = pairData;
    })
    .addCase(updateDerivedPairData, (state, { payload: { pairData, pairId, timeWindow } }) => {
      if (!state.derivedPairDataById[pairId]) {
        state.derivedPairDataById[pairId] = {};
      }
      state.derivedPairDataById[pairId][timeWindow] = pairData;
    }),
);
