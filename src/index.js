import { exec } from 'sudo-prompt'

const debug = require('debug')('add-trusted-cert')

/**
 * Add certificate (in DER or PEM format) from certFile to per-user or local Admin Trust Settings. When modifying
 * per-user Trust Settings, user authentication is required via an authentication dialog. When modifying admin
 * Trust Settings, the process must be running as root, or admin authentication is required.
 *
 * @see man security add-trusted-cert
 *
 * @param {object} options
 * @param {boolean} [options.addToAdminCertStore] If true, adds the cert to the admin cert store
 * @param {string} [options.resultType]
 * @param {Array<string>|string} [options.policyConstraint] Policy constraints
 * @param {string} [options.appPath] Application constraint
 * @param {string} [options.policyString] Policy-specific string
 * @param {Array<string|number>|number|string} [options.allowedError]
 * @param {number} [options.keyUsageCode] Key usage. For more than one usage, add values together (except -1).
 * @param {string} [options.keychain] Keychain to which the cert is added. Default is '/Library/Keychains/System.keychain'.
 * @param {string} [options.settingsFileIn] Input trust settings file; default is user domain
 * @param {string} [options.settingsFileOut] Output trust settings file; default is user domain
 * @param {string} certFile Certificate file to add
 * @returns {Promise<string>} Output of the `security add-trusted-cert` command
 */
export async function addTrustedCert (options = {}, certFile) {
  return new Promise((resolve, reject) => {
    const params = buildAddTrustedCertCmd(options, certFile)

    params.unshift('security')

    debug(`Executing 'security add-trusted-cert' command:`)

    const cmd = params.join(' ')

    debug(cmd)

    exec(
      cmd,
      {
        name: 'Keychain access for adding new certificate'
      },
      (err, stdout, stderr) => {
        if (err) {
          return reject(err)
        }

        if (stderr) {
          return reject(stderr)
        }

        resolve(stdout)
      }
    )
  })
}

/**
 * Builds the command line options for the 'security' command
 *
 * @private
 *
 * @param {object} options
 * @param {boolean} [options.addToAdminCertStore] If true, adds the cert to the admin cert store
 * @param {string} [options.resultType]
 * @param {Array<string>|string} [options.policyConstraint] Policy constraints
 * @param {string} [options.appPath] Application constraint
 * @param {string} [options.policyString] Policy-specific string
 * @param {Array<string|number>|number|string} [options.allowedError]
 * @param {number} [options.keyUsageCode] Key usage. For more than one usage, add values together (except -1).
 * @param {string} [options.keychain] Keychain to which the cert is added. Default is '/Library/Keychains/System.keychain'.
 * @param {string} [options.settingsFileIn] Input trust settings file; default is user domain
 * @param {string} [options.settingsFileOut] Output trust settings file; default is user domain
 * @param {string} certFile Certificate file to add
 * @returns {Array} Command options to pass to 'security' command
 */
export function buildAddTrustedCertCmd (
  {
    addToAdminCertStore,
    resultType,
    policyConstraint,
    appPath,
    policyString,
    allowedError,
    keyUsageCode,
    keychain,
    settingsFileIn,
    settingsFileOut
  },
  certFile
) {
  /**
   * @type {Array<string|number>}
   */
  const cmds = ['add-trusted-cert']

  if (addToAdminCertStore) {
    cmds.push('-d')
  }

  if (resultType) {
    cmds.push('-r')
    cmds.push(resultType)
  }

  if (policyConstraint) {
    if (policyConstraint instanceof Array) {
      policyConstraint.forEach(constraint => {
        cmds.push('-p')
        cmds.push(constraint)
      })
    }

    if (typeof policyConstraint === 'string') {
      cmds.push('-p')
      cmds.push(policyConstraint)
    }
  }

  if (appPath) {
    cmds.push('-a')
    cmds.push(appPath)
  }

  if (policyString) {
    cmds.push('-s')
    cmds.push(policyString)
  }

  if (allowedError) {
    if (allowedError instanceof Array) {
      allowedError.forEach(err => {
        cmds.push('-e')
        cmds.push(err)
      })
    }

    if (typeof allowedError === 'string' || typeof allowedError === 'number') {
      cmds.push('-p')
      cmds.push(allowedError)
    }
  }

  if (keyUsageCode) {
    cmds.push('-u')
    cmds.push(keyUsageCode)
  }

  if (keychain) {
    cmds.push('-k')
    cmds.push(keychain)
  }

  if (!keychain) {
    cmds.push('-k')
    cmds.push('/Library/Keychains/System.keychain')
  }

  if (settingsFileIn) {
    cmds.push('-i')
    cmds.push(settingsFileIn)
  }

  if (settingsFileOut) {
    cmds.push('-o')
    cmds.push(settingsFileOut)
  }

  cmds.push(certFile)

  return cmds
}

/**
 * Policy constraint types
 * @type {{SSL: string, SMIME: string, CODE_SIGN: string, IP_SEC: string, BASIC: string, SW_UPDATE: string, PKG_SIGN: string, EAP: string, MAC_APP_STORE: string, APPLE_ID: string, TIMESTAMPING: string}}
 */
export const POLICY_CONSTRAINTS = {
  SSL: 'ssl',
  SMIME: 'smime',
  CODE_SIGN: 'codeSign',
  IP_SEC: 'ipSec',
  BASIC: 'basic',
  SW_UPDATE: 'swUpdate',
  PKG_SIGN: 'pkgSign',
  EAP: 'eap',
  MAC_APP_STORE: 'macappstore',
  APPLE_ID: 'appleId',
  TIMESTAMPING: 'timestamping'
}

/**
 * Allowed error types
 * @type {{CERT_EXPIRED: string, HOSTNAME_MISMATCH: string}}
 */
export const ALLOWED_ERRORS = {
  CERT_EXPIRED: 'certExpired',
  HOSTNAME_MISMATCH: 'hostnameMismatch'
}

/**
 * Result types
 * @type {{TRUST_ROOT: string, TRUST_AS_ROOT: string, DENY: string, UNSPECIFIED: string}}
 */
export const RESULT_TYPES = {
  // use for root certificates
  TRUST_ROOT: 'trustRoot',
  // trustAsRoot trusts everything signed by that certificate even if it is not a root certificate
  TRUST_AS_ROOT: 'trustAsRoot',
  DENY: 'deny',
  UNSPECIFIED: 'unspecified'
}

/**
 * Key usage code types. Add values to stack.
 * @type {{ANY: string, SIGN: string, ENCRYPT_DECRYPT_DATA: string, ENCRYPT_DECRYPT_KEY: string, SIGN_CERTIFICATE: string, SIGN_REVOCATION: string, KEY_EXCHANGE: string}}
 */
export const KEY_USAGE_CODES = {
  ANY: '-1',
  SIGN: '1',
  ENCRYPT_DECRYPT_DATA: '2',
  ENCRYPT_DECRYPT_KEY: '4',
  SIGN_CERTIFICATE: '8',
  SIGN_REVOCATION: '16',
  KEY_EXCHANGE: '32'
}
