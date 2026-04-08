if (!process.env['DATABASE_URL_TEST']) {
  throw new Error('DATABASE_URL_TEST não definida — abortando testes');
}

process.env['DATABASE_URL'] = process.env['DATABASE_URL_TEST'];
