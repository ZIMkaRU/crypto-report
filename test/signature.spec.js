'use strict'

const path = require('path')
const { assert } = require('chai')

const pathToCsvDir = path.join(__dirname, '../csv')
const pathToTestCsv = path.join(
  pathToCsvDir,
  'p.ardoino_public_trades_FROM_Mon-Mar-25-2019_TO_Tue-Mar-26-2019_ON_2019-04-22T10-06-51.284Z.csv'
)
const pathToTestCsvCopy = path.join(
  pathToCsvDir,
  'COPY_p.ardoino_public_trades_FROM_Mon-Mar-25-2019_TO_Tue-Mar-26-2019_ON_2019-04-22T10-06-51.284Z.csv'
)
const pathToModifiedTestCsv = path.join(
  pathToCsvDir,
  'MODIFIED_p.ardoino_public_trades_FROM_Mon-Mar-25-2019_TO_Tue-Mar-26-2019_ON_2019-04-22T10-06-51.284Z.csv'
)
const pathToTestZip = path.join(
  pathToCsvDir,
  'p.ardoino_multiple-exports_MOMENT_Tue-Apr-23-2019.zip'
)

const {
  getDigitalSignature,
  verifyDigitalSignature
} = require('../index')

const isValidSignature = (signature, isValid) => {
  assert.isString(signature)
  assert.match(
    signature,
    /^-----BEGIN PGP SIGNATURE-----(\s*)|(.*)-----END PGP SIGNATURE-----$/
  )
  assert.isOk(isValid)
}

const isNotValidSignature = (signature, isValid) => {
  assert.isString(signature)
  assert.match(
    signature,
    /^-----BEGIN PGP SIGNATURE-----(\s*)|(.*)-----END PGP SIGNATURE-----$/
  )
  assert.isNotOk(isValid)
}

describe('Digital signature', () => {
  it('it should be valid for CSV file', async () => {
    const signature = await getDigitalSignature(pathToTestCsv)
    const isValid = await verifyDigitalSignature(signature, pathToTestCsv)

    isValidSignature(signature, isValid)
  })

  it('it should be valid for ZIP file', async () => {
    const signature = await getDigitalSignature(pathToTestZip)
    const isValid = await verifyDigitalSignature(signature, pathToTestZip)

    isValidSignature(signature, isValid)
  })

  it('it should be valid for copy of CSV file and signature of original CSV file', async () => {
    const signature = await getDigitalSignature(pathToTestCsv)
    const isValid = await verifyDigitalSignature(signature, pathToTestCsvCopy)

    isValidSignature(signature, isValid)
  })

  it('it should not be valid for ZIP file and signature of CSV file', async () => {
    const signature = await getDigitalSignature(pathToTestCsv)
    const isValid = await verifyDigitalSignature(signature, pathToTestZip)

    isNotValidSignature(signature, isValid)
  })

  it('it should not be valid for modified CSV file and signature of original CSV file', async () => {
    const signature = await getDigitalSignature(pathToTestCsv)
    const isValid = await verifyDigitalSignature(signature, pathToModifiedTestCsv)

    isNotValidSignature(signature, isValid)
  })
})
