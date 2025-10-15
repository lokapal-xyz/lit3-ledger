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
│   └── Lit3Ledger.sol              # Main contract
├── script/
│   ├── DeployLit3Ledger.s.sol      # Deployment script
│   └── InteractWithLit3.s.sol       # Interaction script for queries/archiving
├── test/
│   └── Lit3LedgerTest.t.sol         # Comprehensive test suite
├── scripts/
│   └── normalize-and-hash.js        # Text normalization & SHA-256 hashing utility
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

The `archive-entry.sh` script supports flexible command-line usage for all scenarios. Optional parameters are handled gracefully with sensible defaults.

#### Basic Usage (No Optional Parameters)

Archive an entry without NFT integration or content hashing:

```bash
./archive-entry.sh base-sepolia "Chapter One" "Location" "Timestamp 1" "Timestamp 2" "Entry note"
```

#### With Optional Parameters

All optional parameters are positional but can be omitted:

```bash
./archive-entry.sh <network> <title> <source> <timestamp1> <timestamp2> <curator_note> [nft_address] [nft_id] [text_file]
```

**Examples:**

Archive with NFT integration only:
```bash
./archive-entry.sh base-sepolia "Chapter One" "Location" "Timestamp 1" "Timestamp 2" "Entry note" 0x1234567890abcdef1234567890abcdef12345678 42
```

Archive with text file hashing only (NFT omitted):
```bash
./archive-entry.sh base-sepolia "Chapter One" "Location" "Timestamp 1" "Timestamp 2" "Entry note" none 0 chapter-one.md
```

Archive with NFT and text file:
```bash
./archive-entry.sh base-sepolia "Chapter One" "Location" "Timestamp 1" "Timestamp 2" "Entry note" 0x1234...5678 42 chapter-one.md
```

#### Optional Parameter Details

**`nft_address`** (optional)
- Pass an Ethereum address (0x...) to link an NFT
- Pass `none` or `0x0` to skip NFT integration
- Invalid addresses are automatically converted to zero address
- Default: `none` (no NFT)

**`nft_id`** (optional)
- Pass a number (0, 1, 2, etc.) for the NFT token ID
- Only meaningful if `nft_address` is valid
- Default: `0` (no token ID)

**`text_file`** (optional)
- Path to a markdown file (e.g., `chapter-one.md`)
- The script will normalize the text and compute SHA-256 hash
- Requires Node.js to be installed
- If omitted or file not found, uses zero-hash
- Default: omitted (zero-hash)

---

### Text Normalization & Hashing

The `normalize-and-hash.js` utility applies strict normalization for chapter-style text:

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
node scripts/normalize-and-hash.js /path/to/chapter.md
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

The `archive-updated-entry.sh` script supports flexible command-line usage for all scenarios. Optional parameters are handled gracefully with sensible defaults.

#### Basic Usage (No Optional Parameters)

Update entry without NFT integration or content hashing:

```bash
./archive-updated-entry.sh base-sepolia 0 "Chapter One v2" "Location v2" "Timestamp 1 v2" "Timestamp 2 v2" "Entry note v2"
```

#### With Optional Parameters

All optional parameters are positional but can be omitted:

```bash
./archive-updated-entry.sh <network> <deprecate_index> <title> <source> <timestamp1> <timestamp2> <curator_note> [nft_address] [nft_id] [text_file]
```

**Examples:**

Update entry with NFT integration only:
```bash
./archive-updated-entry.sh base-sepolia 0 "Chapter One v2" "Location v2" "Timestamp 1 v2" "Timestamp 2 v2" "Entry note v2" 0x1234567890abcdef1234567890abcdef12345678 42
```

Update entry with text file hashing only (NFT omitted):
```bash
./archive-updated-entry.sh base-sepolia 0 "Chapter One v2" "Location" "Timestamp 1" "Timestamp 2" "Entry note" none 0 chapter-one-v2.md
```

Update entry with NFT and text file:
```bash
./archive-updated-entry.sh base-sepolia 0 "Chapter One v2" "Location" "Timestamp 1" "Timestamp 2" "Entry note" 0x1234567890abcdef1234567890abcdef12345678 42 chapter-one-v2.md
```

---

## Contract API

### Entry Structure

```solidity
struct Entry {
    string title;           // Entry title
    string source;          // Source/location of the entry
    string timestamp1;      // First timestamp (e.g., reception time)
    string timestamp2;      // Second timestamp (e.g., source transmission time)
    string curatorNote;     // Curator observations
    bool deprecated;        // Deprecation flag
    uint256 versionIndex;   // Version number (auto-incremented)
    address nftAddress;     // NFT contract address (0x0 if none)
    uint256 nftId;          // NFT token ID (0 if none)
    bytes32 contentHash;    // SHA-256 hash of canonical text
}
```

### Main Functions

**Archiving:**
- `archiveEntry(title, source, timestamp1, timestamp2, curatorNote, nftAddress, nftId, contentHash)` - Add new entry (curator only)
- `archiveUpdatedEntry(title, source, timestamp1, timestamp2, curatorNote, nftAddress, nftId, contentHash, deprecateIndex)` - Create new version and deprecate old (curator only)

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