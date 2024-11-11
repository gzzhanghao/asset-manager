import {
  testField,
  createFieldContext,
} from '@lark-opdev/block-basekit-server-api';

async function run() {
  const context = await createFieldContext();
  const res = await testField(
    {
      inputCode: 'hk.0700',
    },
    context as any,
  );
  console.log(res);
}

run();
