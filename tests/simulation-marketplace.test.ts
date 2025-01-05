import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let listingNonce = 0;
const listings = new Map();
const balances = new Map();

// Mock external contracts
const speciesNFT = {
  transferSpecies: (speciesId: number, recipient: string) => true
};

const ecosystemManagement = {
  updateEcosystemStatus: (ecosystemId: number, status: string) => true
};

// Simulated contract functions
function createListing(tokenType: string, tokenId: number, price: number, seller: string) {
  const listingId = ++listingNonce;
  listings.set(listingId, { seller, tokenType, tokenId, price, status: 'active' });
  return listingId;
}

function cancelListing(listingId: number, canceller: string) {
  const listing = listings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (listing.seller !== canceller) throw new Error('Not authorized');
  listing.status = 'cancelled';
  listings.set(listingId, listing);
  return true;
}

function buyListing(listingId: number, buyer: string) {
  const listing = listings.get(listingId);
  if (!listing || listing.status !== 'active') throw new Error('Invalid listing');
  if (balances.get(buyer) < listing.price) throw new Error('Insufficient balance');
  
  balances.set(buyer, balances.get(buyer) - listing.price);
  balances.set(listing.seller, (balances.get(listing.seller) || 0) + listing.price);
  
  if (listing.tokenType === 'species') {
    speciesNFT.transferSpecies(listing.tokenId, buyer);
  } else {
    ecosystemManagement.updateEcosystemStatus(listing.tokenId, 'transferred');
  }
  
  listing.status = 'sold';
  listings.set(listingId, listing);
  return true;
}

function mintTokens(amount: number, recipient: string, minter: string) {
  if (minter !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  balances.set(recipient, (balances.get(recipient) || 0) + amount);
  return true;
}

describe('Simulation Marketplace Contract', () => {
  beforeEach(() => {
    listingNonce = 0;
    listings.clear();
    balances.clear();
  });
  
  it('should create a new listing', () => {
    const id = createListing('species', 1, 100, 'seller1');
    expect(id).toBe(1);
    const listing = listings.get(id);
    expect(listing.tokenType).toBe('species');
    expect(listing.price).toBe(100);
    expect(listing.status).toBe('active');
  });
  
  it('should cancel a listing', () => {
    const id = createListing('ecosystem', 2, 200, 'seller2');
    expect(cancelListing(id, 'seller2')).toBe(true);
    const listing = listings.get(id);
    expect(listing.status).toBe('cancelled');
  });
  
  it('should buy a listing', () => {
    const id = createListing('species', 3, 150, 'seller3');
    mintTokens(200, 'buyer1', 'CONTRACT_OWNER');
    expect(buyListing(id, 'buyer1')).toBe(true);
    const listing = listings.get(id);
    expect(listing.status).toBe('sold');
    expect(balances.get('buyer1')).toBe(50);
    expect(balances.get('seller3')).toBe(150);
  });
  
  it('should mint tokens', () => {
    expect(mintTokens(500, 'user1', 'CONTRACT_OWNER')).toBe(true);
    expect(balances.get('user1')).toBe(500);
  });
  
  it('should not allow unauthorized listing cancellations', () => {
    const id = createListing('ecosystem', 4, 300, 'seller4');
    expect(() => cancelListing(id, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow buying with insufficient balance', () => {
    const id = createListing('species', 5, 400, 'seller5');
    mintTokens(300, 'buyer2', 'CONTRACT_OWNER');
    expect(() => buyListing(id, 'buyer2')).toThrow('Insufficient balance');
  });
  
  it('should not allow unauthorized token minting', () => {
    expect(() => mintTokens(1000, 'user2', 'unauthorized_user')).toThrow('Not authorized');
  });
});

