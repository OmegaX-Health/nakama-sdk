// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: canonical Robinhood protocol artifact, ABIs, and deployment manifests.

export const ROBINHOOD_PROTOCOL_ARTIFACT_BUNDLE_RAW = {
  schemaVersion: 1,
  status: 'ready',
  sourceArtifact: 'nakama-protocol/shared/robinhood/protocol_contract.json',
  sourceArtifactSha256:
    '18890abee0c58ef137d4e4f849a38a9a500b2b38654d6b7e607bd7224a87fc43',
  sourceCommit: '0cb347f1ac0d790b1fc7053a6c0fcb2e0a53dd75',
  deploymentCodeCommitment:
    '0xce06ac68424ff1a9490fdc1629bd9a45936334011d0a91b2ba07cd7470224ad0',
  generatedBy: 'scripts/sync-robinhood-artifacts.mjs',
  contracts: {
    assetRegistry: {
      role: 'assetRegistry',
      contractName: 'AssetRegistry',
      sourceAbi: 'contracts/robinhood/AssetRegistry.abi.json',
      abiSha256:
        '13fb7931d4bb89cf3cdf7360b430d6fa1fceb80349459a76398ad3063545492c',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'authority_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
          ],
          name: 'AssetAlreadyRegistered',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              internalType: 'enum RobinhoodTypes.AssetStatus',
              name: 'status',
              type: 'uint8',
            },
          ],
          name: 'AssetNotActive',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
          ],
          name: 'AssetNotRegistered',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAssetMetadata',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidCommitment',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'assetId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'nameHash',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'symbolHash',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'runtimeCodeHash',
              type: 'bytes32',
            },
          ],
          name: 'AssetRegistered',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.AssetStatus',
              name: 'previous',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.AssetStatus',
              name: 'next',
              type: 'uint8',
            },
          ],
          name: 'AssetStatusChanged',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'currentAuthority',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'pendingAuthority',
              type: 'address',
            },
          ],
          name: 'AuthorityTransferStarted',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'previousAuthority',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'newAuthority',
              type: 'address',
            },
          ],
          name: 'AuthorityTransferred',
          type: 'event',
        },
        {
          inputs: [],
          name: 'acceptAuthority',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'authority',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'nextAuthority',
              type: 'address',
            },
          ],
          name: 'beginAuthorityTransfer',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
          ],
          name: 'getAsset',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'assetId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'nameHash',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'symbolHash',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'runtimeCodeHash',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint64',
                  name: 'registeredAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'chainId',
                  type: 'uint64',
                },
                {
                  internalType: 'uint8',
                  name: 'decimals',
                  type: 'uint8',
                },
                {
                  internalType: 'enum RobinhoodTypes.AssetStatus',
                  name: 'status',
                  type: 'uint8',
                },
              ],
              internalType: 'struct AssetRegistry.AssetRecord',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'pendingAuthority',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'assetId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'expectedNameHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'expectedSymbolHash',
              type: 'bytes32',
            },
          ],
          name: 'registerAsset',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
          ],
          name: 'requireActiveAsset',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'assetId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'nameHash',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'symbolHash',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'runtimeCodeHash',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint64',
                  name: 'registeredAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'chainId',
                  type: 'uint64',
                },
                {
                  internalType: 'uint8',
                  name: 'decimals',
                  type: 'uint8',
                },
                {
                  internalType: 'enum RobinhoodTypes.AssetStatus',
                  name: 'status',
                  type: 'uint8',
                },
              ],
              internalType: 'struct AssetRegistry.AssetRecord',
              name: 'record',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              internalType: 'enum RobinhoodTypes.AssetStatus',
              name: 'next',
              type: 'uint8',
            },
          ],
          name: 'setAssetStatus',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
    },
    templateRegistry: {
      role: 'templateRegistry',
      contractName: 'TemplateRegistry',
      sourceAbi: 'contracts/robinhood/TemplateRegistry.abi.json',
      abiSha256:
        'e48e9c7835f61bd2b343e3bba0ed3199a27498b504d7695ea4290da68894e3d0',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'authority_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
          ],
          name: 'AlreadyRegistered',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'expected',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'actual',
              type: 'address',
            },
          ],
          name: 'FactoryMismatch',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidCommitment',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'enum RobinhoodTypes.TemplateStatus',
              name: 'status',
              type: 'uint8',
            },
          ],
          name: 'SuiteNotActive',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
          ],
          name: 'UnknownSuite',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'currentAuthority',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'pendingAuthority',
              type: 'address',
            },
          ],
          name: 'AuthorityTransferStarted',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'previousAuthority',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'newAuthority',
              type: 'address',
            },
          ],
          name: 'AuthorityTransferred',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'factory',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'major',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'minor',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'patch',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'deploymentCodeCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'templateCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'reviewCommitment',
              type: 'bytes32',
            },
          ],
          name: 'SuiteRegistered',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.TemplateStatus',
              name: 'previous',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.TemplateStatus',
              name: 'next',
              type: 'uint8',
            },
          ],
          name: 'SuiteStatusChanged',
          type: 'event',
        },
        {
          inputs: [],
          name: 'acceptAuthority',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'authority',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'nextAuthority',
              type: 'address',
            },
          ],
          name: 'beginAuthorityTransfer',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
          ],
          name: 'getSuite',
          outputs: [
            {
              components: [
                {
                  internalType: 'address',
                  name: 'factory',
                  type: 'address',
                },
                {
                  internalType: 'bytes32',
                  name: 'deploymentCodeCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'templateCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'reviewCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint64',
                  name: 'registeredAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint32',
                  name: 'major',
                  type: 'uint32',
                },
                {
                  internalType: 'uint32',
                  name: 'minor',
                  type: 'uint32',
                },
                {
                  internalType: 'uint32',
                  name: 'patch',
                  type: 'uint32',
                },
                {
                  internalType: 'enum RobinhoodTypes.TemplateStatus',
                  name: 'status',
                  type: 'uint8',
                },
              ],
              internalType: 'struct TemplateRegistry.SuiteRecord',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'pendingAuthority',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'factory',
              type: 'address',
            },
            {
              internalType: 'uint32',
              name: 'major',
              type: 'uint32',
            },
            {
              internalType: 'uint32',
              name: 'minor',
              type: 'uint32',
            },
            {
              internalType: 'uint32',
              name: 'patch',
              type: 'uint32',
            },
            {
              internalType: 'bytes32',
              name: 'deploymentCodeCommitment',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'templateCommitment',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'reviewCommitment',
              type: 'bytes32',
            },
          ],
          name: 'registerSuite',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'factory',
              type: 'address',
            },
          ],
          name: 'requireActiveSuite',
          outputs: [
            {
              components: [
                {
                  internalType: 'address',
                  name: 'factory',
                  type: 'address',
                },
                {
                  internalType: 'bytes32',
                  name: 'deploymentCodeCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'templateCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'reviewCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint64',
                  name: 'registeredAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint32',
                  name: 'major',
                  type: 'uint32',
                },
                {
                  internalType: 'uint32',
                  name: 'minor',
                  type: 'uint32',
                },
                {
                  internalType: 'uint32',
                  name: 'patch',
                  type: 'uint32',
                },
                {
                  internalType: 'enum RobinhoodTypes.TemplateStatus',
                  name: 'status',
                  type: 'uint8',
                },
              ],
              internalType: 'struct TemplateRegistry.SuiteRecord',
              name: 'record',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'enum RobinhoodTypes.TemplateStatus',
              name: 'next',
              type: 'uint8',
            },
          ],
          name: 'setSuiteStatus',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
    },
    poolRegistry: {
      role: 'poolRegistry',
      contractName: 'PoolRegistry',
      sourceAbi: 'contracts/robinhood/PoolRegistry.abi.json',
      abiSha256:
        '532c832ffaab3485150f5e50fe3e201071387bc3b4d704d85ae3cdbbe9bde390',
      abi: [
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
          ],
          name: 'AlreadyRegistered',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidDeployment',
          type: 'error',
        },
        {
          inputs: [],
          name: 'OnlyFactory',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'sponsor',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'program',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'vault',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'membershipRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'decisionModule',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'claimManager',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'settlementModule',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'agentAuthorizationRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'safetyGuardian',
              type: 'address',
            },
          ],
          name: 'ProgramRegistered',
          type: 'event',
        },
        {
          inputs: [],
          name: 'factory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
          ],
          name: 'getDeployment',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'program',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'vault',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'membershipRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'decisionModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'claimManager',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlementModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'agentAuthorizationRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'safetyGuardian',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramDeployment',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programCount',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'offset',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'limit',
              type: 'uint256',
            },
          ],
          name: 'programIds',
          outputs: [
            {
              internalType: 'bytes32[]',
              name: 'page',
              type: 'bytes32[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'sponsor',
              type: 'address',
            },
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'program',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'vault',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'membershipRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'decisionModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'claimManager',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlementModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'agentAuthorizationRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'safetyGuardian',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramDeployment',
              name: 'deployment',
              type: 'tuple',
            },
          ],
          name: 'registerProgram',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
          ],
          name: 'suiteOf',
          outputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    factory: {
      role: 'factory',
      contractName: 'NakamaFactory',
      sourceAbi: 'contracts/robinhood/NakamaFactory.abi.json',
      abiSha256:
        'd36dce8a99ec631fd175bea1f7d3d9e49dd34d0794f9c417deddcf38e34964d8',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'assetRegistry_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'templateRegistry_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'expectedFundingAsset_',
              type: 'address',
            },
            {
              internalType: 'bytes32[8]',
              name: 'componentCreationCodeHashes_',
              type: 'bytes32[8]',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'uint8',
              name: 'component',
              type: 'uint8',
            },
            {
              internalType: 'address',
              name: 'expected',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'actual',
              type: 'address',
            },
          ],
          name: 'DeploymentAddressMismatch',
          type: 'error',
        },
        {
          inputs: [],
          name: 'FundingAssetIdentityChanged',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'expected',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'actual',
              type: 'address',
            },
          ],
          name: 'FundingAssetMismatch',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint8',
              name: 'component',
              type: 'uint8',
            },
            {
              internalType: 'bytes32',
              name: 'expected',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'actual',
              type: 'bytes32',
            },
          ],
          name: 'InvalidBytecode',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidSalt',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'sponsor',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'program',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'vault',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'membershipRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'decisionModule',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'claimManager',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'settlementModule',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'agentAuthorizationRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'safetyGuardian',
              type: 'address',
            },
          ],
          name: 'ProgramSuiteDeployed',
          type: 'event',
        },
        {
          inputs: [],
          name: 'assetRegistry',
          outputs: [
            {
              internalType: 'contract AssetRegistry',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'component',
              type: 'uint256',
            },
          ],
          name: 'componentCreationCodeHash',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'create2Deployer',
          outputs: [
            {
              internalType: 'contract Create2Deployer',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'salt',
              type: 'bytes32',
            },
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'sponsorLegalEntityCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'metadataCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'privacyCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'operationsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'activationChecklistCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'fundingAsset',
                  type: 'address',
                },
                {
                  internalType: 'uint64',
                  name: 'enrollmentOpensAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'activeAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'runoffAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'closesAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'initialDecisionWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealDecisionWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint256',
                  name: 'perMemberCap',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'aggregateCap',
                  type: 'uint256',
                },
                {
                  internalType: 'uint32',
                  name: 'maxMembers',
                  type: 'uint32',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramConfig',
              name: 'config',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'address',
                  name: 'sponsor',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'operator',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'initialReviewer',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'appealReviewer',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlement',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'guardian',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'eligibilityAttestor',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.RoleConfig',
              name: 'roles',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'bytes',
                  name: 'protectionProgram',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'poolVault',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'membershipRegistry',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'decisionModule',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'claimManager',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'settlementModule',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'agentAuthorizationRegistry',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'safetyGuardian',
                  type: 'bytes',
                },
              ],
              internalType: 'struct NakamaFactory.ComponentBytecodes',
              name: 'bytecodes',
              type: 'tuple',
            },
          ],
          name: 'deployProgram',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'program',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'vault',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'membershipRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'decisionModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'claimManager',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlementModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'agentAuthorizationRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'safetyGuardian',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramDeployment',
              name: 'deployment',
              type: 'tuple',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentCodeCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'sponsor',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'salt',
              type: 'bytes32',
            },
          ],
          name: 'deriveProgramId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'expectedFundingAsset',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'expectedFundingAssetId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'expectedFundingAssetNameHash',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'expectedFundingAssetRuntimeCodeHash',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'expectedFundingAssetSymbolHash',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'poolRegistry',
          outputs: [
            {
              internalType: 'contract PoolRegistry',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'suiteId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'salt',
              type: 'bytes32',
            },
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'sponsorLegalEntityCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'metadataCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'privacyCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'operationsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'activationChecklistCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'fundingAsset',
                  type: 'address',
                },
                {
                  internalType: 'uint64',
                  name: 'enrollmentOpensAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'activeAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'runoffAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'closesAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'initialDecisionWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealDecisionWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint256',
                  name: 'perMemberCap',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'aggregateCap',
                  type: 'uint256',
                },
                {
                  internalType: 'uint32',
                  name: 'maxMembers',
                  type: 'uint32',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramConfig',
              name: 'config',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'address',
                  name: 'sponsor',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'operator',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'initialReviewer',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'appealReviewer',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlement',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'guardian',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'eligibilityAttestor',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.RoleConfig',
              name: 'roles',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'bytes',
                  name: 'protectionProgram',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'poolVault',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'membershipRegistry',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'decisionModule',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'claimManager',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'settlementModule',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'agentAuthorizationRegistry',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'safetyGuardian',
                  type: 'bytes',
                },
              ],
              internalType: 'struct NakamaFactory.ComponentBytecodes',
              name: 'bytecodes',
              type: 'tuple',
            },
          ],
          name: 'predictDeployment',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'program',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'vault',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'membershipRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'decisionModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'claimManager',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlementModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'agentAuthorizationRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'safetyGuardian',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramDeployment',
              name: 'deployment',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'templateRegistry',
          outputs: [
            {
              internalType: 'contract TemplateRegistry',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    program: {
      role: 'program',
      contractName: 'ProtectionProgram',
      sourceAbi: 'contracts/robinhood/ProtectionProgram.abi.json',
      abiSha256:
        'bf6cf82d09944d94a7f668c9bd44b99705ba9d75ea6e76084c0b5053d0c35d81',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'deploymentFactory_',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'programId_',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'suiteId_',
              type: 'bytes32',
            },
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'sponsorLegalEntityCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'metadataCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'privacyCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'operationsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'activationChecklistCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'fundingAsset',
                  type: 'address',
                },
                {
                  internalType: 'uint64',
                  name: 'enrollmentOpensAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'activeAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'runoffAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'closesAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'initialDecisionWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealDecisionWindow',
                  type: 'uint64',
                },
                {
                  internalType: 'uint256',
                  name: 'perMemberCap',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'aggregateCap',
                  type: 'uint256',
                },
                {
                  internalType: 'uint32',
                  name: 'maxMembers',
                  type: 'uint32',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramConfig',
              name: 'config',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'address',
                  name: 'sponsor',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'operator',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'initialReviewer',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'appealReviewer',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlement',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'guardian',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'eligibilityAttestor',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.RoleConfig',
              name: 'roles',
              type: 'tuple',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'ActionPaused',
          type: 'error',
        },
        {
          inputs: [],
          name: 'ActivationNotApproved',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'required',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'tracked',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'actual',
              type: 'uint256',
            },
          ],
          name: 'FundingIncomplete',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidConfiguration',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.ProgramState',
              name: 'expected',
              type: 'uint8',
            },
            {
              internalType: 'enum RobinhoodTypes.ProgramState',
              name: 'actual',
              type: 'uint8',
            },
          ],
          name: 'InvalidState',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint64',
              name: 'requiredAt',
              type: 'uint64',
            },
            {
              internalType: 'uint64',
              name: 'actualTime',
              type: 'uint64',
            },
          ],
          name: 'InvalidTime',
          type: 'error',
        },
        {
          inputs: [],
          name: 'ModulesAlreadyBound',
          type: 'error',
        },
        {
          inputs: [],
          name: 'ModulesNotBound',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint32',
              name: 'activeMemberships',
              type: 'uint32',
            },
            {
              internalType: 'uint256',
              name: 'openRequests',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'encumberedAssets',
              type: 'uint256',
            },
          ],
          name: 'OutstandingRights',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bool',
              name: 'sponsorApproval',
              type: 'bool',
            },
          ],
          name: 'ActivationApprovalRecorded',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bool',
              name: 'sponsorApproval',
              type: 'bool',
            },
          ],
          name: 'CancellationApprovalRecorded',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'address',
              name: 'vault',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'membershipRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'decisionModule',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'claimManager',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'settlementModule',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'agentAuthorizationRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'safetyGuardian',
              type: 'address',
            },
          ],
          name: 'ModulesBound',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.ProgramState',
              name: 'previous',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.ProgramState',
              name: 'next',
              type: 'uint8',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
          ],
          name: 'ProgramStateChanged',
          type: 'event',
        },
        {
          inputs: [],
          name: 'MAX_REVIEW_WINDOW',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'activate',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'activationChecklistCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'activeAt',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'agentAuthorizationRegistry',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'aggregateCap',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'appealDecisionWindow',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'appealReviewer',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'appealWindow',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'approveActivationAsOperator',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'approveActivationAsSponsor',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'approveCancellationAsOperator',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'approveCancellationAsSponsor',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'program',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'vault',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'membershipRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'decisionModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'claimManager',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'settlementModule',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'agentAuthorizationRegistry',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'safetyGuardian',
                  type: 'address',
                },
              ],
              internalType: 'struct RobinhoodTypes.ProgramDeployment',
              name: 'deployment',
              type: 'tuple',
            },
          ],
          name: 'bindModules',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'cancelBeforePromises',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'claimManager',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'close',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'closesAt',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'decisionModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentFactory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'eligibilityAttestor',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'enrollmentOpensAt',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'enterRunoff',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'fundingAsset',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'guardianRole',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'initialDecisionWindow',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'initialReviewer',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'isActionPaused',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'isTerminal',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'markFunded',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'markReviewed',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'maxMembers',
          outputs: [
            {
              internalType: 'uint32',
              name: '',
              type: 'uint32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'membershipRegistry',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'metadataCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'openEnrollment',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'operationsCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'operator',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'operatorActivationApproved',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'operatorCancellationApproved',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'perMemberCap',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'privacyCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'runoffAt',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'safetyGuardian',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'settlementModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'settlementRole',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'sponsor',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'sponsorActivationApproved',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'sponsorCancellationApproved',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'sponsorLegalEntityCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'state',
          outputs: [
            {
              internalType: 'enum RobinhoodTypes.ProgramState',
              name: '',
              type: 'uint8',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'suiteId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'termsCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'vault',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    vault: {
      role: 'vault',
      contractName: 'PoolVault',
      sourceAbi: 'contracts/robinhood/PoolVault.abi.json',
      abiSha256:
        'e59200c586ab359fc217928a31395c6627f321b2977e63925fc37198ffc3008d',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'deploymentFactory_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'sponsor_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'asset_',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'programId_',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'aggregateCap_',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'cap',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'nextFunded',
              type: 'uint256',
            },
          ],
          name: 'FundingCapExceeded',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAmount',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidState',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'actual',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'tracked',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'encumbered',
              type: 'uint256',
            },
          ],
          name: 'LedgerInsolvent',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'available',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'requested',
              type: 'uint256',
            },
          ],
          name: 'LiabilityExceeded',
          type: 'error',
        },
        {
          inputs: [],
          name: 'ModulesAlreadyBound',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'ObligationExists',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'PendingRequestExists',
          type: 'error',
        },
        {
          inputs: [],
          name: 'ReentrancyGuardReentrantCall',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
          ],
          name: 'SafeERC20FailedOperation',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'UnknownObligation',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'UnknownPendingRequest',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'expected',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'senderDelta',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'recipientDelta',
              type: 'uint256',
            },
          ],
          name: 'UnsupportedTokenBehavior',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'int256',
              name: 'amountDelta',
              type: 'int256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'memberRemaining',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'maximumRemainingMemberLiability',
              type: 'uint256',
            },
          ],
          name: 'MemberLiabilityChanged',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'address',
              name: 'membershipRegistry',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'claimManager',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'settlementModule',
              type: 'address',
            },
          ],
          name: 'ModulesBound',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'approvedUnpaidObligations',
              type: 'uint256',
            },
          ],
          name: 'ObligationApproved',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'asset',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'trackedAssets',
              type: 'uint256',
            },
          ],
          name: 'ObligationSettled',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'int256',
              name: 'amountDelta',
              type: 'int256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'pendingRequestReservation',
              type: 'uint256',
            },
          ],
          name: 'PendingReservationChanged',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'sponsor',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'asset',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'trackedAssets',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'fundingReference',
              type: 'bytes32',
            },
          ],
          name: 'SponsorFundingReceived',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'sponsor',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'asset',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'SponsorRefundClaimed',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'asset',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'maturedRefunds',
              type: 'uint256',
            },
          ],
          name: 'SponsorRefundMatured',
          type: 'event',
        },
        {
          inputs: [],
          name: 'accounting',
          outputs: [
            {
              components: [
                {
                  internalType: 'uint256',
                  name: 'sponsorFunded',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'settled',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'sponsorRefunded',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'maximumRemainingMemberLiability',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'pendingRequestReservation',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedUnpaidObligations',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'maturedRefunds',
                  type: 'uint256',
                },
              ],
              internalType: 'struct RobinhoodTypes.VaultAccounting',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'actualAssets',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'aggregateCap',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'approveObligation',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'asset',
          outputs: [
            {
              internalType: 'contract IERC20',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'membershipRegistry_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'claimManager_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'settlementModule_',
              type: 'address',
            },
          ],
          name: 'bindModules',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'claimManager',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
          ],
          name: 'claimMaturedRefund',
          outputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'clearPendingRequest',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentFactory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'encumberedAssets',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'freeLiquidity',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              internalType: 'bytes32',
              name: 'fundingReference',
              type: 'bytes32',
            },
          ],
          name: 'fund',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'matureSponsorRefund',
          outputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'memberRemaining',
          outputs: [
            {
              internalType: 'uint256',
              name: 'remaining',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'membershipRegistry',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'obligationAmount',
          outputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'pendingByMember',
          outputs: [
            {
              internalType: 'uint256',
              name: 'pending',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'pendingMembership',
          outputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'pendingReservation',
          outputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'reconciled',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'registerMemberLiability',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'releaseMemberLiability',
          outputs: [
            {
              internalType: 'uint256',
              name: 'released',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'reservePendingRequest',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
          ],
          name: 'settleObligation',
          outputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'settlementModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'sponsor',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'trackedAssets',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'unaccountedAssets',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    membershipRegistry: {
      role: 'membershipRegistry',
      contractName: 'MembershipRegistry',
      sourceAbi: 'contracts/robinhood/MembershipRegistry.abi.json',
      abiSha256:
        '72ac7186bd82a54da9d795e44889c77c60a020bcec212af92a12f49ebec3f818',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'deploymentFactory_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'vault_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'account',
              type: 'address',
            },
          ],
          name: 'AccountAlreadyBound',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAuthorization',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidCommitment',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidShortString',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidState',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'MembershipAlreadyExists',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint32',
              name: 'maximum',
              type: 'uint32',
            },
          ],
          name: 'MembershipLimitReached',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'OpenRequestExists',
          type: 'error',
        },
        {
          inputs: [],
          name: 'SignatureAlreadyUsed',
          type: 'error',
        },
        {
          inputs: [],
          name: 'SignatureExpired',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'string',
              name: 'str',
              type: 'string',
            },
          ],
          name: 'StringTooLong',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'claimManager',
              type: 'address',
            },
          ],
          name: 'ClaimManagerBound',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [],
          name: 'EIP712DomainChanged',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'recoveryNonce',
              type: 'uint256',
            },
          ],
          name: 'MembershipAccountRecovered',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'memberCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'activatedAt',
              type: 'uint64',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'expiresAt',
              type: 'uint64',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'termsCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'privacyCommitment',
              type: 'bytes32',
            },
          ],
          name: 'MembershipActivated',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.MembershipState',
              name: 'previous',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.MembershipState',
              name: 'next',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'releasedLiability',
              type: 'uint256',
            },
          ],
          name: 'MembershipStateChanged',
          type: 'event',
        },
        {
          inputs: [],
          name: 'ELIGIBILITY_TYPEHASH',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'RECOVERY_TYPEHASH',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'memberCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'account',
                  type: 'address',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'privacyCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Eligibility',
              name: 'eligibility',
              type: 'tuple',
            },
            {
              internalType: 'bytes',
              name: 'signature',
              type: 'bytes',
            },
          ],
          name: 'activateMembership',
          outputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'activeMemberships',
          outputs: [
            {
              internalType: 'uint32',
              name: '',
              type: 'uint32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'digest',
              type: 'bytes32',
            },
          ],
          name: 'authorizationUsed',
          outputs: [
            {
              internalType: 'bool',
              name: 'used',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'claimManager_',
              type: 'address',
            },
          ],
          name: 'bindClaimManager',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'cancelMembership',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'claimManager',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentFactory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'memberCommitment',
              type: 'bytes32',
            },
          ],
          name: 'deriveMembershipId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'eip712Domain',
          outputs: [
            {
              internalType: 'bytes1',
              name: 'fields',
              type: 'bytes1',
            },
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'version',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'chainId',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'verifyingContract',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'salt',
              type: 'bytes32',
            },
            {
              internalType: 'uint256[]',
              name: 'extensions',
              type: 'uint256[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'expireMembership',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'memberCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'account',
                  type: 'address',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'privacyCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Eligibility',
              name: 'eligibility',
              type: 'tuple',
            },
          ],
          name: 'hashEligibility',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'membershipId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'newAccount',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.RecoveryAuthorization',
              name: 'authorization',
              type: 'tuple',
            },
          ],
          name: 'hashRecovery',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'isActiveMembership',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'account',
              type: 'address',
            },
          ],
          name: 'isMembershipAccount',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'membership',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'memberCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint64',
                  name: 'activatedAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'expiresAt',
                  type: 'uint64',
                },
                {
                  internalType: 'enum RobinhoodTypes.MembershipState',
                  name: 'state',
                  type: 'uint8',
                },
              ],
              internalType: 'struct MembershipRegistry.Membership',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'account',
              type: 'address',
            },
          ],
          name: 'membershipIdForAccount',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'membershipId',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'newAccount',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.RecoveryAuthorization',
              name: 'authorization',
              type: 'tuple',
            },
            {
              internalType: 'bytes',
              name: 'signature',
              type: 'bytes',
            },
          ],
          name: 'recoverMembershipAccount',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'recoveryNonces',
          outputs: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'totalActivated',
          outputs: [
            {
              internalType: 'uint32',
              name: '',
              type: 'uint32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'vault',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    decisionModule: {
      role: 'decisionModule',
      contractName: 'DecisionModule',
      sourceAbi: 'contracts/robinhood/DecisionModule.abi.json',
      abiSha256:
        '0b317cb621d6b27adb2c41aa1a4772391811b612647b009e98a61c3466e1c7af',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'deploymentFactory_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [],
          name: 'ClaimManagerAlreadyBound',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidDecision',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'expected',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'provided',
              type: 'uint256',
            },
          ],
          name: 'InvalidNonce',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidRole',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidShortString',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidSignature',
          type: 'error',
        },
        {
          inputs: [],
          name: 'SignatureExpired',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'string',
              name: 'str',
              type: 'string',
            },
          ],
          name: 'StringTooLong',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'claimManager',
              type: 'address',
            },
          ],
          name: 'ClaimManagerBound',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'signer',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint8',
              name: 'reviewRound',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'uint8',
              name: 'action',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'decisionDigest',
              type: 'bytes32',
            },
          ],
          name: 'DecisionConsumed',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [],
          name: 'EIP712DomainChanged',
          type: 'event',
        },
        {
          inputs: [],
          name: 'DECISION_TYPEHASH',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'claimManager_',
              type: 'address',
            },
          ],
          name: 'bindClaimManager',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'claimManager',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'requestId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'evidenceManifestCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint32',
                  name: 'evidenceVersion',
                  type: 'uint32',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewRound',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewerRole',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'action',
                  type: 'uint8',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'recipientCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'publicReasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Decision',
              name: 'decision',
              type: 'tuple',
            },
            {
              internalType: 'bytes',
              name: 'signature',
              type: 'bytes',
            },
          ],
          name: 'consumeDecision',
          outputs: [
            {
              internalType: 'address',
              name: 'signer',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentFactory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'eip712Domain',
          outputs: [
            {
              internalType: 'bytes1',
              name: 'fields',
              type: 'bytes1',
            },
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'version',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'chainId',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'verifyingContract',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'salt',
              type: 'bytes32',
            },
            {
              internalType: 'uint256[]',
              name: 'extensions',
              type: 'uint256[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'requestId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'evidenceManifestCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint32',
                  name: 'evidenceVersion',
                  type: 'uint32',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewRound',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewerRole',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'action',
                  type: 'uint8',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'recipientCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'publicReasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Decision',
              name: 'decision',
              type: 'tuple',
            },
          ],
          name: 'hashDecision',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'signer',
              type: 'address',
            },
          ],
          name: 'nonces',
          outputs: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'requestId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'evidenceManifestCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint32',
                  name: 'evidenceVersion',
                  type: 'uint32',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewRound',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewerRole',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'action',
                  type: 'uint8',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'recipientCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'publicReasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Decision',
              name: 'decision',
              type: 'tuple',
            },
            {
              internalType: 'bytes',
              name: 'signature',
              type: 'bytes',
            },
          ],
          name: 'verifyDecision',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    requestManager: {
      role: 'requestManager',
      contractName: 'ClaimManager',
      sourceAbi: 'contracts/robinhood/ClaimManager.abi.json',
      abiSha256:
        '59bcd33d84304ddc2a05003367b3d36dfb849b3ae8d180bb5045db85eb27aa42',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'deploymentFactory_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'vault_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'membershipRegistry_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'decisionModule_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'uint64',
              name: 'deadline',
              type: 'uint64',
            },
          ],
          name: 'DeadlineClosed',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'uint64',
              name: 'deadline',
              type: 'uint64',
            },
          ],
          name: 'DeadlineOpen',
          type: 'error',
        },
        {
          inputs: [],
          name: 'DeadlineOverflow',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAmount',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidCommitment',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidDecision',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidState',
          type: 'error',
        },
        {
          inputs: [],
          name: 'SettlementModuleAlreadyBound',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'evidenceManifestCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'evidenceVersion',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'decisionDeadline',
              type: 'uint64',
            },
          ],
          name: 'AppealFiled',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'evidenceManifestCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'evidenceVersion',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'decisionDeadline',
              type: 'uint64',
            },
          ],
          name: 'EvidenceManifestUpdated',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'requestedAmount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'evidenceManifestCommitment',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'evidenceVersion',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'decisionDeadline',
              type: 'uint64',
            },
          ],
          name: 'RequestOpened',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.RequestState',
              name: 'previous',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'enum RobinhoodTypes.RequestState',
              name: 'next',
              type: 'uint8',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'publicReasonCode',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'approvedAmount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'deadline',
              type: 'uint64',
            },
          ],
          name: 'RequestStateChanged',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'settlementModule',
              type: 'address',
            },
          ],
          name: 'SettlementModuleBound',
          type: 'event',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'settlementModule_',
              type: 'address',
            },
          ],
          name: 'bindSettlementModule',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'canReleaseMembership',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'decisionModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentFactory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
          ],
          name: 'deriveRequestId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'escalateInformationTimeout',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'escalateNoQuorum',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'requestId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'evidenceManifestCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint32',
                  name: 'evidenceVersion',
                  type: 'uint32',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewRound',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewerRole',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'action',
                  type: 'uint8',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'recipientCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'publicReasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Decision',
              name: 'decision',
              type: 'tuple',
            },
            {
              internalType: 'address',
              name: 'payoutRecipient',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'recipientSalt',
              type: 'bytes32',
            },
            {
              internalType: 'bytes',
              name: 'signature',
              type: 'bytes',
            },
          ],
          name: 'executeAppealDecision',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'programId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'requestId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'termsCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'evidenceManifestCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint32',
                  name: 'evidenceVersion',
                  type: 'uint32',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewRound',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'reviewerRole',
                  type: 'uint8',
                },
                {
                  internalType: 'uint8',
                  name: 'action',
                  type: 'uint8',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'recipientCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'publicReasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'validUntil',
                  type: 'uint64',
                },
              ],
              internalType: 'struct RobinhoodTypes.Decision',
              name: 'decision',
              type: 'tuple',
            },
            {
              internalType: 'address',
              name: 'payoutRecipient',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'recipientSalt',
              type: 'bytes32',
            },
            {
              internalType: 'bytes',
              name: 'signature',
              type: 'bytes',
            },
          ],
          name: 'executeInitialDecision',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'appealManifestCommitment',
              type: 'bytes32',
            },
          ],
          name: 'fileAppeal',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'finalizeUnappealedDenial',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'markSettled',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'membershipRegistry',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'evidenceManifestCommitment',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'payoutRecipientCommitment',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'requestedAmount',
              type: 'uint256',
            },
          ],
          name: 'openRequest',
          outputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'openRequestCount',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
            {
              internalType: 'bytes32',
              name: 'recipientSalt',
              type: 'bytes32',
            },
          ],
          name: 'recipientCommitment',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'request',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'membershipId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'evidenceManifestCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'recipientCommitment',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'publicReasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'address',
                  name: 'payoutRecipient',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'requestedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'approvedAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'openedAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'decisionDeadline',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'appealDeadline',
                  type: 'uint64',
                },
                {
                  internalType: 'uint32',
                  name: 'evidenceVersion',
                  type: 'uint32',
                },
                {
                  internalType: 'uint8',
                  name: 'currentRound',
                  type: 'uint8',
                },
                {
                  internalType: 'enum RobinhoodTypes.RequestState',
                  name: 'state',
                  type: 'uint8',
                },
              ],
              internalType: 'struct ClaimManager.Request',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'requestNonce',
          outputs: [
            {
              internalType: 'uint256',
              name: 'nextNonce',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'settlementDetails',
          outputs: [
            {
              internalType: 'enum RobinhoodTypes.RequestState',
              name: 'requestState',
              type: 'uint8',
            },
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'settlementModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'membershipId',
              type: 'bytes32',
            },
          ],
          name: 'unresolvedByMembership',
          outputs: [
            {
              internalType: 'uint256',
              name: 'unresolved',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'newEvidenceManifestCommitment',
              type: 'bytes32',
            },
          ],
          name: 'updateEvidence',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'vault',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    settlementModule: {
      role: 'settlementModule',
      contractName: 'SettlementModule',
      sourceAbi: 'contracts/robinhood/SettlementModule.abi.json',
      abiSha256:
        '18c43554fa0c78aae415c0265e177be11f7c1a46c04f66f97d7ba6fbcea22b03',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'vault_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'claimManager_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'expected',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'actual',
              type: 'uint256',
            },
          ],
          name: 'AmountMismatch',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidState',
          type: 'error',
        },
        {
          inputs: [],
          name: 'ReentrancyGuardReentrantCall',
          type: 'error',
        },
        {
          inputs: [],
          name: 'SettlementPaused',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'recipient',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'asset',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'settlementActor',
              type: 'address',
            },
          ],
          name: 'SettlementExecuted',
          type: 'event',
        },
        {
          inputs: [],
          name: 'claimManager',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
          ],
          name: 'settle',
          outputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'vault',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    agentAuthorizationRegistry: {
      role: 'agentAuthorizationRegistry',
      contractName: 'AgentAuthorizationRegistry',
      sourceAbi: 'contracts/robinhood/AgentAuthorizationRegistry.abi.json',
      abiSha256:
        '1adb7dee99b684a16343dfa9fd39334df60014e8fc243b44c3c8b5bd37562a74',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'deploymentFactory_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'vault_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'decisionModule_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'settlementModule_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [],
          name: 'AgentActionsPaused',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
          ],
          name: 'AuthorizationAlreadyExists',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
          ],
          name: 'AuthorizationLimitExceeded',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
          ],
          name: 'AuthorizationNotActive',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAuthorization',
          type: 'error',
        },
        {
          inputs: [],
          name: 'SafetyGuardianAlreadyBound',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'target',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bytes4',
              name: 'selector',
              type: 'bytes4',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'reasonCode',
              type: 'bytes32',
            },
          ],
          name: 'AuthorizationBlocked',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'target',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bytes4',
              name: 'selector',
              type: 'bytes4',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'callsInPeriod',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'assetAmountInPeriod',
              type: 'uint256',
            },
          ],
          name: 'AuthorizationConsumed',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'target',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bytes4',
              name: 'selector',
              type: 'bytes4',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'expiresAt',
              type: 'uint64',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'maxCallsPerPeriod',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'purposeCommitment',
              type: 'bytes32',
            },
          ],
          name: 'AuthorizationGranted',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'AuthorizationRevoked',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'safetyGuardian',
              type: 'address',
            },
          ],
          name: 'SafetyGuardianBound',
          type: 'event',
        },
        {
          inputs: [],
          name: 'MAX_AUTHORIZATION_DURATION',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'MAX_CALLS_PER_PERIOD',
          outputs: [
            {
              internalType: 'uint32',
              name: '',
              type: 'uint32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'MAX_PERIOD',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'safetyGuardian_',
              type: 'address',
            },
          ],
          name: 'bindSafetyGuardian',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'selector',
              type: 'bytes4',
            },
            {
              internalType: 'uint256',
              name: 'nativeValue',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
          ],
          name: 'consumeAuthorization',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'decisionModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deploymentFactory',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'target',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'selector',
              type: 'bytes4',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
          ],
          name: 'deriveAuthorizationId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
          ],
          name: 'getAuthorization',
          outputs: [
            {
              components: [
                {
                  internalType: 'address',
                  name: 'principal',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'target',
                  type: 'address',
                },
                {
                  internalType: 'bytes4',
                  name: 'selector',
                  type: 'bytes4',
                },
                {
                  internalType: 'uint256',
                  name: 'maxNativeValue',
                  type: 'uint256',
                },
                {
                  internalType: 'address',
                  name: 'asset',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'maxAssetAmountPerAction',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'periodAssetLimit',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'periodSeconds',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'issuedAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'expiresAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint32',
                  name: 'maxCallsPerPeriod',
                  type: 'uint32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'purposeCommitment',
                  type: 'bytes32',
                },
              ],
              internalType: 'struct RobinhoodTypes.Authorization',
              name: '',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'uint64',
                  name: 'periodStartedAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint32',
                  name: 'callsInPeriod',
                  type: 'uint32',
                },
                {
                  internalType: 'uint256',
                  name: 'assetAmountInPeriod',
                  type: 'uint256',
                },
              ],
              internalType: 'struct AgentAuthorizationRegistry.Consumption',
              name: '',
              type: 'tuple',
            },
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: 'address',
                  name: 'principal',
                  type: 'address',
                },
                {
                  internalType: 'address',
                  name: 'target',
                  type: 'address',
                },
                {
                  internalType: 'bytes4',
                  name: 'selector',
                  type: 'bytes4',
                },
                {
                  internalType: 'uint256',
                  name: 'maxNativeValue',
                  type: 'uint256',
                },
                {
                  internalType: 'address',
                  name: 'asset',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'maxAssetAmountPerAction',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'periodAssetLimit',
                  type: 'uint256',
                },
                {
                  internalType: 'uint64',
                  name: 'periodSeconds',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'issuedAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'expiresAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint32',
                  name: 'maxCallsPerPeriod',
                  type: 'uint32',
                },
                {
                  internalType: 'uint256',
                  name: 'nonce',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'purposeCommitment',
                  type: 'bytes32',
                },
              ],
              internalType: 'struct RobinhoodTypes.Authorization',
              name: 'authorization',
              type: 'tuple',
            },
          ],
          name: 'grantAuthorization',
          outputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'guardianRevoke',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'target',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'selector',
              type: 'bytes4',
            },
          ],
          name: 'isAuthorized',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'principal',
              type: 'address',
            },
          ],
          name: 'nonces',
          outputs: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'reasonCode',
              type: 'bytes32',
            },
          ],
          name: 'revokeAuthorization',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
          ],
          name: 'revoked',
          outputs: [
            {
              internalType: 'bool',
              name: 'revoked',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'safetyGuardian',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'settlementModule',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'vault',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    safetyGuardian: {
      role: 'safetyGuardian',
      contractName: 'SafetyGuardian',
      sourceAbi: 'contracts/robinhood/SafetyGuardian.abi.json',
      abiSha256:
        '7a41de5c4524a4182f9315575613487e4829830c0eb74c720d22a84513a66bd5',
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'program_',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'agentAuthorizationRegistry_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'expected',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'actual',
              type: 'bytes32',
            },
          ],
          name: 'IncidentMismatch',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidAddress',
          type: 'error',
        },
        {
          inputs: [],
          name: 'InvalidPause',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'PauseAlreadyActive',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'PauseNotActive',
          type: 'error',
        },
        {
          inputs: [],
          name: 'Unauthorized',
          type: 'error',
        },
        {
          inputs: [],
          name: 'UnpauseNotApproved',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'AgentAuthorizationEmergencyRevoked',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'dependencyId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bool',
              name: 'active',
              type: 'bool',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'reasonCode',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'DependencyWarningChanged',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'OperatorUnpauseApproved',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'bytes32',
              name: 'reasonCode',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'uint64',
              name: 'reviewRequiredAt',
              type: 'uint64',
            },
          ],
          name: 'ScopePaused',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'programId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
          ],
          name: 'ScopeUnpaused',
          type: 'event',
        },
        {
          inputs: [],
          name: 'MAX_PAUSE_DURATION',
          outputs: [
            {
              internalType: 'uint64',
              name: '',
              type: 'uint64',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'agentAuthorizationRegistry',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
            {
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'approveUnpauseAsOperator',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'dependencyId',
              type: 'bytes32',
            },
          ],
          name: 'dependencyWarning',
          outputs: [
            {
              internalType: 'bool',
              name: 'active',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'isPaused',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
            {
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'reasonCode',
              type: 'bytes32',
            },
            {
              internalType: 'uint64',
              name: 'reviewRequiredAt',
              type: 'uint64',
            },
          ],
          name: 'pause',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'pauseRecord',
          outputs: [
            {
              components: [
                {
                  internalType: 'bytes32',
                  name: 'incidentId',
                  type: 'bytes32',
                },
                {
                  internalType: 'bytes32',
                  name: 'reasonCode',
                  type: 'bytes32',
                },
                {
                  internalType: 'uint64',
                  name: 'openedAt',
                  type: 'uint64',
                },
                {
                  internalType: 'uint64',
                  name: 'reviewRequiredAt',
                  type: 'uint64',
                },
                {
                  internalType: 'bool',
                  name: 'active',
                  type: 'bool',
                },
                {
                  internalType: 'bool',
                  name: 'operatorUnpauseApproved',
                  type: 'bool',
                },
              ],
              internalType: 'struct SafetyGuardian.PauseRecord',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'program',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'programId',
          outputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
          ],
          name: 'reviewRequired',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'authorizationId',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'revokeAgentAuthorization',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: 'dependencyId',
              type: 'bytes32',
            },
            {
              internalType: 'bool',
              name: 'active',
              type: 'bool',
            },
            {
              internalType: 'bytes32',
              name: 'reasonCode',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'setDependencyWarning',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'enum RobinhoodTypes.PauseScope',
              name: 'scope',
              type: 'uint8',
            },
            {
              internalType: 'bytes32',
              name: 'incidentId',
              type: 'bytes32',
            },
          ],
          name: 'unpause',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
    },
  },
  deployments: {
    mainnet: {
      schemaVersion: 1,
      status: 'unconfigured',
      network: 'mainnet',
      chainId: 4663,
      caip2: 'eip155:4663',
      protocolRelease: null,
      sourceCommit: null,
      artifactBundleSha256: null,
      deploymentTransaction: null,
      deploymentBlock: null,
      deploymentBlockHash: null,
      contracts: {},
      settlementAsset: {
        network: 'mainnet',
        chainId: 4663,
        caip2: 'eip155:4663',
        address: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
        name: 'Global Dollar',
        symbol: 'USDG',
        decimals: 6,
        status: 'verified',
      },
      verified: false,
      auditStatus: 'unaudited',
      auditReportSha256: null,
      releaseApprovalSha256: null,
    },
    testnet: {
      schemaVersion: 1,
      status: 'unconfigured',
      network: 'testnet',
      chainId: 46630,
      caip2: 'eip155:46630',
      protocolRelease: null,
      sourceCommit: null,
      artifactBundleSha256: null,
      deploymentTransaction: null,
      deploymentBlock: null,
      deploymentBlockHash: null,
      contracts: {},
      settlementAsset: {
        network: 'testnet',
        chainId: 46630,
        caip2: 'eip155:46630',
        address: null,
        name: 'Global Dollar',
        symbol: 'USDG',
        decimals: 6,
        status: 'unconfigured',
      },
      verified: false,
      auditStatus: 'unaudited',
      auditReportSha256: null,
      releaseApprovalSha256: null,
    },
  },
} as const;
