import { FieldContext } from '@lark-opdev/block-basekit-server-api';

interface MarketInfo {
  keys: string[];
  code: number;
  normalize?: (input: string) => string;
}

const MARKET_TYPES: MarketInfo[] = [
  {
    keys: ['HK', '港股'],
    code: 116,
    normalize: (code) => code.padStart(5, '0'),
  },
  {
    keys: ['SH', '上证'],
    code: 1,
    normalize: (code) => code.padStart(6, '0'),
  },
  {
    keys: ['SZ', '深证', 'BJ', '北证'],
    code: 0,
    normalize: (value) => value.padStart(6, '0'),
  },
  {
    keys: ['US', '美股'],
    code: 105,
    normalize: (value) => value.toUpperCase(),
  },
  {
    keys: ['FUND', '基金'],
    code: 150,
    normalize: (code) => code.padStart(6, '0'),
  },
];

export interface FetchParams {
  type: string;
  code: string;
}

export interface FetchResult {
  code: string;
  name: string;
  price: number;
  currency: string;
  exchange_rate: number;
  update_time: number;
  url: string;
}

export async function fetch(
  params: FetchParams,
  context: FieldContext,
): Promise<FetchResult> {
  const market = MARKET_TYPES.find((market) =>
    market.keys.includes(params.type.toUpperCase()),
  );

  const code = market?.normalize?.(params.code) ?? params.code;

  const url = `https://push2.eastmoney.com/api/qt/stock/get?${new URLSearchParams(
    {
      cb: 'cb',
      fields: 'f43,f57,f58,f59,f86,f154,f600,f601',
      secid: `${market?.code ?? params.type}.${code}`,
      invt: '2',
      _: String(Date.now()),
    },
  )}`;

  const res = await context.fetch(url).then((res) => res.text());
  const data = JSON.parse(res.slice(3, -2)).data;

  if (!data) {
    throw new Error(url);
  }

  const formatNumber = (price: number, accu: number) =>
    Number((price / Math.pow(10, accu)).toFixed(accu));

  return {
    code: data.f57,
    name: data.f58,
    price: formatNumber(data.f43, data.f59),
    currency: data.f600 === '-' ? '人民币' : data.f600,
    exchange_rate: data.f600 === '-' ? 1 : formatNumber(data.f601, data.f154),
    update_time: data.f86 * 1000,
    url,
  };
}
