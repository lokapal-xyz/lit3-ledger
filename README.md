# Lit3 Ledger

A Solidity smart contract for archiving versioned metadata of literary artifacts and narrative fragments on Base blockchain networks. Only the designated Curator can add or update entries, making it perfect for curated storytelling projects, digital literature archives, or any content requiring immutable timestamping, content verification, and provenance.

---

## Features

- **Curator-Only Access**: Only the designated curator can archive and update entries
- **Immutable Versioned Storage**: Entries track version history with automatic increment on updates
- **Content Verification**: SHA-256 hashing for canonical text verification
- **NFT Integration**: Optional connection to NFT contracts for collectible integration
- **Flexible Metadata**: Optional fields for NFT data and content hashes
- **Multi-Network Support**: Deploy to Base Sepolia (testnet) and Base Mainnet
- **Contract Verification**: Automatic source code verification on BaseScan
- **Query Functions**: Retrieve entries by index, batch, latest, or by source
- **GraphQL Integration**: The Graph subgraph for complex queries and real-time updates

---

## Project Structure

```
├── src/
│   └── Lit3Ledger.sol               # Main contract
├── script/
│   ├── DeployLit3Ledger.s.sol       # Deployment script
│   └── InteractWithLit3.s.sol       # Interaction script for queries/archiving
├── test/
│   └── Lit3LedgerTest.t.sol         # Comprehensive test suite
├── scripts/
│   └── hnp1.js                      # Text normalization & SHA-256 hashing utility
├── .env.example                     # Environment variables template
├── deploy-lit3ledger.sh             # Multi-network deployment script
├── archive-entry.sh                 # Archive new entries with optional hashing
├── archive-updated-entry.sh         # Update previous entries
├── query-lit3.sh                    # Query existing entries
├── setup-lit3-subgraph.sh           # Subgraph setup script
├── foundry.toml                     # Foundry settings
└── README.md                        # This file
```

---

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/) (v18+) - for text normalization
- Base Sepolia ETH ([faucet](https://faucet.quicknode.com/base))
- BaseScan API key ([sign up](https://etherscan.io/apis?id=8453))

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/lokapal-xyz/lit3-ledger
cd lit3-ledger
```

2. **Install Foundry dependencies:**
```bash
forge install
```

3. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your private key and API key
```

4. **Make scripts executable:**
```bash
chmod +x deploy-lit3ledger.sh archive-entry.sh archive-updated-entry.sh query-lit3.sh setup-lit3-subgraph.sh
```

5. **Run tests:**
```bash
forge test
```

### Environment Configuration

Complete the `.env` file with the following content:

```bash
# Private Key (create a dedicated wallet for this project)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# API Keys
BASESCAN_API_KEY=your_basescan_api_key_here

# RPC URLs (optional - uses public endpoints by default)
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Contract Addresses (auto-populated after deployment)
CONTRACT_ADDRESS_BASE_SEPOLIA=
CONTRACT_ADDRESS_BASE=

# Active Contract Address (auto-populated after deployment)
CONTRACT_ADDRESS=
```

### Deployment

Deploy to Base Sepolia (testnet) first:

```bash
./deploy-lit3ledger.sh base-sepolia
```

For mainnet deployment (uses real ETH):

```bash
./deploy-lit3ledger.sh base
```

The script will:
- Deploy and verify the contract
- Create deployment JSON files
- Update your `.env` with contract addresses
- Provide BaseScan links

---

## Usage

### Archive New Entry

The `archive-entry.sh` script uses **named arguments (flags)**, making it clean and easy to use with optional parameters.

#### Command Syntax

The script requires the `--network` flag, but all other parameters are optional and can be passed in any order.

```bash
./archive-entry.sh --network <network> [OPTIONAL FLAGS...]
```

#### Optional Flags

| Flag (Short/Long) | Description | Default Value in Contract |
| :--- | :--- | :--- |
| **-t, --title** | Entry title (e.g., "Chapter One") | `""` (empty string) |
| **-s, --source** | Source/location of the entry | `""` (empty string) |
| **-a, --timestamp1** | First timestamp (e.g., "2025-10-11 14:30:00 UTC") | `""` (empty string) |
| **-b, --timestamp2** | Second timestamp (e.g., "Lanka Time") | `""` (empty string) |
| **-c, --curator-note** | Observations from the Curator | `""` (empty string) |
| **-f, --nft-address** | NFT contract address (e.g., 0x...) | `0x0...0` (zero address) |
| **-d, --nft-id** | NFT token ID | `0` |
| **-l, --text-file** | Path to a file for content hashing (requires Node.js) | `0x0...0` (zero hash) |
| **-x, --permaweb-link** | IPFS/Arweave link (e.g., ipfs://Qm...) | `""` (empty string) |
| **-p, --license** | License declaration (e.g., 'CC BY-SA 4.0') | `""` (empty string) |

#### Examples

**Basic Usage (Minimum Required: Network)**
Archive an entry using only the required network flag, plus a title and note for context.

```bash
./archive-entry.sh -n base-sepolia -t "Chapter One" -c "First entry"
```

**With NFT Integration**
Archive an entry and associate it with a specific NFT. Note that unused flags (`--text-file`, etc.) are simply omitted.

```bash
./archive-entry.sh \
  --network base-sepolia \
  --title "Chapter One" \
  --source "Archive Node" \
  --timestamp1 "2025-10-11 14:30:00 UTC" \
  --curator-note "First entry" \
  --nft-address 0x1234567890abcdef1234567890abcdef12345678 \
  --nft-id 42
```

**With Content Hashing (Permanence Framework)**
Archive an entry, compute a content hash from a local file, and provide a permaweb link and license.

```bash
./archive-entry.sh \
  -n base-sepolia \
  -t "Chapter One" \
  -c "Entry note with hash" \
  -l chapter-one.md \
  -x "ipfs://QmTest123" \
  -p "CC BY-SA 4.0"
```

**Full Entry**
Archive an entry with all optional fields.

```bash
./archive-entry.sh \
  --network base-sepolia \
  --title "Introduction" \
  --source "Book 0" \
  --timestamp1 "2025-10-11 UTC" \
  --timestamp2 "2025-12-11 UTC" \
  --curator-note "First entry" \
  --nft-address 0xfC295DBCbB9CCdA53B152AA3fc64dB84d6C538fF \
  --nft-id 0 \
  --text-file placeholder.md \
  --permaweb-link "ipfs://bafkreihrm3tvrubern7kkpxr65ta2zu2cmdkfbfqmcth4eoefly37ke4xq" \
  --license "CC BY-NC-SA 4.0"
```

---

### Text Normalization & Hashing

The `hnp1.js` utility applies strict normalization for chapter-style text:

1. **BOM removal** - Strips Byte Order Mark if present
2. **Unicode normalization** - Converts to NFC form (composed characters)
3. **Line ending standardization** - All lines become LF (`\n`)
4. **Trailing whitespace removal** - Per-line cleanup
5. **Tab normalization** - All tabs become 4 spaces
6. **Leading/trailing blank lines removed** - Cleans document boundaries
7. **Multiple blank line collapse** - Max 1 blank line between content
8. **Single trailing newline** - Enforces consistent file ending

This ensures that the same canonical text always produces the same hash, enabling verification.

**Manual hashing:**
```bash
node scripts/hnp1.js /path/to/chapter.md
```

Output: `0x<64-char-hex-hash>`

---

### Query Entries

Get contract status:
```bash
./query-lit3.sh base-sepolia status
```

Get latest entries:
```bash
./query-lit3.sh base-sepolia get-latest 5
```

Get specific entry by index:
```bash
./query-lit3.sh base-sepolia get-entry 0
```

All available query commands:
- `status` - Contract information and current curator
- `get-total` - Total number of archived entries
- `get-entry <index>` - Specific entry by index
- `get-latest [count]` - Latest entries (default: 5)
- `get-batch <start_index> <count>` - Batch of entries

---

### Update Entry

The `archive-updated-entry.sh` script also uses **named arguments (flags)**, requiring the network and the index of the entry to be deprecated.

#### Command Syntax

The script requires the `--network` and `--deprecate-index` flags. All other parameters are optional and can be passed in any order.

```bash
./archive-updated-entry.sh --network <network> --deprecate-index <index> [OPTIONAL FLAGS...]
```

#### Optional Flags

The optional flags are the same as `archive-entry.sh` (see table above).

#### Examples

**Basic Update (Minimum Required: Network and Index)**
Update an entry, changing only the title and curator note.

```bash
./archive-updated-entry.sh \
  -n base-sepolia \
  -i 5 \
  -t "Chapter One v2" \
  -c "Updated with corrections"
```

**Full Update**
Update an entry with all optional fields.

```bash
./archive-updated-entry.sh \
  --network base-sepolia \
  --deprecate-index 0 \
  --title "Introduction - Version 2" \
  --source "Book 0" \
  --timestamp1 "2025-10-11 UTC" \
  --timestamp2 "2025-12-11 UTC" \
  --curator-note "First entry" \
  --nft-address 0xfC295DBCbB9CCdA53B152AA3fc64dB84d6C538fF \
  --nft-id 0 \
  --text-file placeholder.md \
  --permaweb-link "ipfs://bafkreihrm3tvrubern7kkpxr65ta2zu2cmdkfbfqmcth4eoefly37ke4xq" \
  --license "CC BY-NC-SA 4.0"
```

---

## Contract API

### Entry Structure

```solidity
struct Entry {
    // Ledger Framework items
    string title;           // Entry title
    string source;          // Source/location of the entry
    string timestamp1;      // First timestamp (e.g., reception time)
    string timestamp2;      // Second timestamp (e.g., source transmission time)
    string curatorNote;     // Curator observations
    bool deprecated;        // Deprecation flag
    // Token Framework items
    uint256 versionIndex;   // Version number (auto-incremented)
    address nftAddress;     // NFT contract address (0x0 if none)
    uint256 nftId;          // NFT token ID (0 if none)
    // Permanence Framework items
    bytes32 contentHash;    // SHA-256 hash of canonical text
    string permawebLink;    // Decentralized storage reference
    string license;         // License declaration
}
```

### Main Functions

**Archiving:**
- `archiveEntry(title, source, timestamp1, timestamp2, curatorNote, nftAddress, nftId, contentHash, permawebLink, license)` - Add new entry (curator only)
- `archiveUpdatedEntry(title, source, timestamp1, timestamp2, curatorNote, nftAddress, nftId, contentHash, permawebLink, license, deprecateIndex)` - Create new version and deprecate old (curator only)

**Querying:**
- `getEntry(uint256 index)` - Get entry by index
- `getTotalEntries()` - Get total number of entries
- `getLatestEntries(uint256 count)` - Get latest entries
- `getEntriesBatch(uint256 start, uint256 count)` - Get batch of entries

**Governance:**
- `initiateCuratorTransfer(address newCurator)` - Initiate curator role transfer (curator only)
- `acceptCuratorTransfer()` - Confirm curator role transfer

---

## Versioning & Updates

The contract supports semantic versioning for entry updates:

1. **First archive**: Entry created with `versionIndex = 1`
2. **First update**: Using `archiveUpdatedEntry()` on index `n` creates version 2 and deprecates version 1
3. **Subsequent updates**: Each call increments the version and deprecates the previous

Your frontend can display: "Viewing version 3 of 5 versions"

### Deprecation Workflow

```
archive-entry.sh → Entry v1 (active)
                ↓
archive-updated-entry.sh → Entry v1 (deprecated=true), Entry v2 (active)
                       ↓
archive-updated-entry.sh → Entry v2 (deprecated=true), Entry v3 (active)
```

---

## Integration with Frontend Applications

### The Graph Integration

For production applications, integrate with The Graph for efficient querying:

1. Create a subgraph indexing the contract events
2. Use GraphQL queries for complex filtering and pagination
3. Implement real-time updates with subscriptions

- To view the full Subgraph implementation, [**click here**](subgraph-deployment-guide.md)

### Next.js Integration

Keep contracts and frontend in separate repositories:

```
my-website/                  # Next.js app
├── lib/
│   └── contracts/           # Copy deployment JSONs
└── components/

lit3-ledger/                 # This repository
└── deployments/
```

Copy deployment files when needed:
```bash
cp deployments/base.json ../my-website/lib/contracts/
```

---

## Network Information

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://faucet.quicknode.com/base

### Base Mainnet
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

---

## Security Considerations

- **Curator Role**: Only the curator can add/update entries. Transfer this role carefully
- **Private Key**: Use a dedicated wallet for contract operations
- **Testnet First**: Always test on Base Sepolia before mainnet deployment
- **Content Hash Verification**: Verify canonical hashes by running the normalization locally
- **Immutability**: Only the latest version is "active" (`deprecated = false`). All versions remain on-chain for audit

---

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test
forge test --match-test testArchiveEntry

# Run with verbose output
forge test -vvv
```

Tests cover:
- Deployment and initialization
- Entry archiving and versioning
- Updated entry archiving with deprecation
- Access control (curator-only functions)
- Retrieval functions and edge cases
- Event emission
- Versioning chain tests
- Fuzz testing for edge cases

---

## Use Cases

This contract pattern is suitable for:
- Digital literature and storytelling projects
- Content archiving with provenance and versioning
- Timestamped metadata storage
- Curated digital art projects with multiple versions
- Academic research with immutable records and version control
- Creative writing communities with editorial workflows
- Interactive fiction projects with branching narratives
- Publishing platforms requiring content verification

---

## Security Disclaimer

This contract has **not been formally audited** by a third-party security firm. While the code has been thoroughly tested on Sepolia testnet and reviewed for common vulnerabilities, it may still contain bugs or security issues.

**Use at your own risk.** If you intend to deploy this contract with real assets or significant value:

- Consider getting a formal security audit from a reputable firm
- Deploy on testnet first and thoroughly test with your use case
- Have the contract reviewed by experienced Solidity developers
- Use conservative assumptions about potential vulnerabilities
- Consider implementing gradual rollout and monitoring strategies

The authors and contributors are not responsible for any losses or damages resulting from the use of this code.

---

## License

MIT License - see LICENSE file for details

## Support

- Create an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed information including network, transaction hashes, and error messages

---

Built with Foundry by lokapal.eth