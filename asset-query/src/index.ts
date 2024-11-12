import {
  basekit,
  FieldType,
  FieldCode,
  FieldComponent,
  NumberFormatter,
  DateFormatter,
  field,
} from '@lark-opdev/block-basekit-server-api';

import { fetch } from './lib/eastmoney-stock';

// 通过addDomainList添加请求接口的域名
basekit.addDomainList(['push2.eastmoney.com']);

basekit.addField({
  // 定义捷径的i18n语言资源
  i18n: {
    messages: {
      'zh-CN': {
        code: '代码',
        name: '名称',
        price: '价格',
        currency: '币种',
        exchange_rate: '汇率',
        update_time: '更新时间',
      },
      'en-US': {
        code: 'Ticker',
        name: 'Name',
        price: 'Price',
        currency: 'Currency',
        exchange_rate: 'Exchange Rate',
        update_time: 'Update Time',
      },
      'ja-JP': {
        code: 'ティッカー',
        name: '名前',
        price: '価格',
        currency: '通貨',
        exchange_rate: '為替レート',
        update_time: '更新時間',
      },
    },
  },
  // 定义捷径的入参
  formItems: [
    {
      key: 'inputCode',
      label: field.t('code'),
      component: FieldComponent.FieldSelect,
      tooltips: [
        {
          type: 'text',
          content:
            '需要查询的基金 / 股票代码，如 "0700.HK"、"510050.SH"。支持类型：`SZ` 上证；`SZ` 深证；`HK` 港股；`US` - 美股；`FUND` - 国内开放式基金',
        },
      ],
      props: {
        supportType: [FieldType.Text, FieldType.Number],
      },
      validator: {
        required: true,
      },
    },
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Object,
    extra: {
      icon: {
        light:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHg9IjYiIHk9IjIwIiB3aWR0aD0iOCIgaGVpZ2h0PSIxNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cmVjdCB4PSIyMCIgeT0iMTQiIHdpZHRoPSI4IiBoZWlnaHQ9IjI2IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCA0NFY0MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxyZWN0IHg9IjM0IiB5PSIxMiIgd2lkdGg9IjgiIGhlaWdodD0iOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTAgMjBWMTAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzggMzRWMjEiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzggMTJWNCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
      },
      properties: [
        {
          key: 'code',
          title: field.t('code'),
          type: FieldType.Text,
        },
        {
          key: 'name',
          title: field.t('name'),
          type: FieldType.Text,
          primary: true,
          isGroupByKey: true,
        },
        {
          key: 'price',
          title: field.t('price'),
          type: FieldType.Number,
          extra: {
            formatter: NumberFormatter.DIGITAL_ROUNDED_3,
          },
        },
        {
          key: 'currency',
          title: field.t('currency'),
          type: FieldType.Text,
        },
        {
          key: 'exchange_rate',
          title: field.t('exchange_rate'),
          type: FieldType.Number,
          extra: {
            formatter: NumberFormatter.DIGITAL_ROUNDED_4,
          },
        },
        {
          key: 'update_time',
          title: field.t('update_time'),
          type: FieldType.DateTime,
          extra: {
            dateFormat: DateFormatter.DATE_TIME_WITH_HYPHEN,
          },
        },
        {
          key: 'url',
          title: 'URL',
          type: FieldType.Text,
          hidden: true,
        },
      ],
    },
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  async execute(params, context) {
    try {
      const inputCode = normalizeTextInput(params.inputCode);
      if (!/^\w+\.\w+$/.test(inputCode)) {
        return {
          code: FieldCode.InvalidArgument,
        };
      }
      const [code, type] = inputCode.split('.');
      return {
        code: FieldCode.Success,
        data: await fetch({ type, code }, context),
      };
    } catch (error: any) {
      return {
        code: FieldCode.Error,
        msg: error.message,
      };
    }
  },
});

function normalizeTextInput(param: any): string {
  if (!param) {
    return param || '';
  }
  if (!Array.isArray(param)) {
    return String(param);
  }
  return param
    .map((seg: any) => {
      if (!seg || typeof seg !== 'object') {
        return seg;
      }
      return seg.text ?? seg;
    })
    .join('');
}

export default basekit;
