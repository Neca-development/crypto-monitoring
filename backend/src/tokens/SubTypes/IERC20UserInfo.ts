import { IERC20TknTotalBalance } from "./IERC20TknTotalBalance";
import { IERC20TsxWithTokenType } from "./IERC20TsxWithTokenType";

export interface IERC20UserInfo {
    transactions?: IERC20TsxWithTokenType[]
    totalBalance?: IERC20TknTotalBalance[]
}