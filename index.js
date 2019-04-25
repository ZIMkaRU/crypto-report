'use strict'

require('colors')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const {
  crypto: { hash },
  util: { Uint8Array_to_hex: uint8ArrayToHex },
  generateKey,
  sign,
  verify,
  key,
  cleartext: { fromText },
  signature: { readArmored }
} = require('openpgp')

const readFile = promisify(fs.readFile)

const publicKeysStore = new Map()

const _getFileHash = async (pathToFile) => {
  const buffer = await readFile(pathToFile)
  const fileUint8Array = new Uint8Array(buffer)

  const hashUint8Array = await hash.sha256(fileUint8Array)

  return uint8ArrayToHex(hashUint8Array)
}

const getDigitalSignature = async (
  pathToFile
) => {
  const fileHash = await _getFileHash(pathToFile)

  const {
    privateKeyArmored,
    publicKeyArmored
  } = await generateKey({
    userIds: [{ name: 'Use Name', email: 'fake@example.com' }],
    curve: 'ed25519'
  })

  const { keys: [privKeyObj] } = await key.readArmored(privateKeyArmored)

  const { signature } = await sign({
    message: fromText(fileHash),
    privateKeys: [privKeyObj],
    detached: true
  })

  publicKeysStore.set(fileHash, publicKeyArmored)

  console.log('[hash]:'.blue, fileHash.rainbow)
  console.log('\n[signature]:\n'.yellow, signature)

  return signature
}

const verifyDigitalSignature = async (signature, pathToFile) => {
  try {
    const fileHash = await _getFileHash(pathToFile)
    const publicKeyArmored = publicKeysStore.get(fileHash)

    const { keys: [pubKeyObj] } = await key.readArmored(publicKeyArmored)

    const {
      signatures: [sign]
    } = await verify({
      message: fromText(fileHash),
      signature: await readArmored(signature),
      publicKeys: pubKeyObj
    })

    const isValid = !!sign.valid

    console.log('[isValid]:'.yellow, isValid, '\n')

    return isValid
  } catch (err) {
    console.log('[isValid]:'.red, false, '\n')

    return false
  }
}

module.exports = {
  getDigitalSignature,
  verifyDigitalSignature
}

void (async () => {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  try {
    const pathToTestCsv = path.join(
      __dirname,
      'csv',
      'p.ardoino_public_trades_FROM_Mon-Mar-25-2019_TO_Tue-Mar-26-2019_ON_2019-04-22T10-06-51.284Z.csv'
    )

    const signature1 = await getDigitalSignature(pathToTestCsv)
    await verifyDigitalSignature(signature1, pathToTestCsv)
  } catch (err) {
    console.error('ERR'.bgRed, err)
  }
})()
