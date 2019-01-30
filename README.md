# add-trusted-cert

An API for calling the `security add-trusted-cert` command in macOS to add certificates to the system keychain.

This is useful if you are generating a root CA / self-signed certificate and want to auto-register it into the keychain.

For more information, see `man security` and search for the `add-trusted-cert` command.

## Notes

- Using this will prompt the user for sudo access for `security` to write to the keychain,
followed by another confirmation to add the certificate to the trust store.
- I have never gotten the `policyConstraint` flags to work with `trustAsRoot` for `resultType`
- I cannot offer support for troubleshooting the `security` parameters, it's very much a black box in general

## Usage

```js
import { addTrustedCert, POLICY_CONSTRAINTS, RESULT_TYPES } from 'add-trusted-cert'

(async () => {
  // Add a root certificate / certificate authority
  // This will set the policy for the cert to 'Always Trust'
  // Be aware of the security implications of allowing the cert to be trusted for everything
  await addTrustedCert({
    addToAdminCertStore: true,
    resultType: RESULT_TYPES.TRUST_ROOT,
  }, 'root.crt')
})()
```

## Debugging

To see the command line output that is generated, add:

`DEBUG=add-trusted-cert <your node app start command>`

### API

## addTrustedCert(options, certFile) ⇒ <code>Promise.&lt;string&gt;</code>

Add certificate (in DER or PEM format) from certFile to per-user or local Admin Trust Settings. When modifying
per-user Trust Settings, user authentication is required via an authentication dialog. When modifying admin
Trust Settings, the process must be running as root, or admin authentication is required.

**Returns**: <code>Promise.&lt;string&gt;</code> - Output of the `security add-trusted-cert` command
**See**: man security add-trusted-cert

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| [options.addToAdminCertStore] | <code>boolean</code> | If true, adds the cert to the admin cert store |
| [options.resultType] | <code>string</code> |  |
| [options.policyConstraint] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | Policy constraints |
| [options.appPath] | <code>string</code> | Application constraint |
| [options.policyString] | <code>string</code> | Policy-specific string |
| [options.allowedError] | <code>Array.&lt;(string\|number)&gt;</code> \| <code>number</code> \| <code>string</code> |  |
| [options.keyUsageCode] | <code>number</code> | Key usage. For more than one usage, add values together (except -1). |
| [options.keychain] | <code>string</code> | Keychain to which the cert is added. Default is '/Library/Keychains/System.keychain'. |
| [options.settingsFileIn] | <code>string</code> | Input trust settings file; default is user domain |
| [options.settingsFileOut] | <code>string</code> | Output trust settings file; default is user domain |
| certFile | <code>string</code> | Certificate file to add |
