import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastSpeciesId = 0;
const speciesData = new Map();
const speciesOwners = new Map();

// Simulated contract functions
function mintSpecies(ecosystemId: number, name: string, traits: Array<{trait: string, value: string}>, rarity: number, creator: string) {
  const speciesId = ++lastSpeciesId;
  speciesData.set(speciesId, { creator, ecosystemId, name, traits, rarity });
  speciesOwners.set(speciesId, creator);
  return speciesId;
}

function transferSpecies(speciesId: number, sender: string, recipient: string) {
  if (speciesOwners.get(speciesId) !== sender) throw new Error('Not authorized');
  speciesOwners.set(speciesId, recipient);
  return true;
}

function evolveSpecies(speciesId: number, newTraits: Array<{trait: string, value: string}>, evolver: string) {
  const species = speciesData.get(speciesId);
  if (!species) throw new Error('Invalid species');
  if (species.creator !== evolver) throw new Error('Not authorized');
  species.traits = newTraits;
  speciesData.set(speciesId, species);
  return true;
}

describe('Species NFT Contract', () => {
  beforeEach(() => {
    lastSpeciesId = 0;
    speciesData.clear();
    speciesOwners.clear();
  });
  
  it('should mint a new species NFT', () => {
    const id = mintSpecies(1, 'Luminous Fern', [
      { trait: 'height', value: '1.5m' },
      { trait: 'luminosity', value: 'high' }
    ], 8, 'creator1');
    expect(id).toBe(1);
    const species = speciesData.get(id);
    expect(species.name).toBe('Luminous Fern');
    expect(species.traits.length).toBe(2);
    expect(speciesOwners.get(id)).toBe('creator1');
  });
  
  it('should transfer species ownership', () => {
    const id = mintSpecies(2, 'Floating Jellyfish', [
      { trait: 'size', value: '30cm' },
      { trait: 'buoyancy', value: 'high' }
    ], 6, 'creator2');
    expect(transferSpecies(id, 'creator2', 'newowner1')).toBe(true);
    expect(speciesOwners.get(id)).toBe('newowner1');
  });
  
  it('should evolve species traits', () => {
    const id = mintSpecies(3, 'Adaptive Chameleon', [
      { trait: 'color_change_speed', value: 'medium' },
      { trait: 'camouflage_effectiveness', value: 'high' }
    ], 7, 'creator3');
    const newTraits = [
      { trait: 'color_change_speed', value: 'very_high' },
      { trait: 'camouflage_effectiveness', value: 'extreme' },
      { trait: 'telepathic_abilities', value: 'low' }
    ];
    expect(evolveSpecies(id, newTraits, 'creator3')).toBe(true);
    const evolvedSpecies = speciesData.get(id);
    expect(evolvedSpecies.traits.length).toBe(3);
    expect(evolvedSpecies.traits[2].trait).toBe('telepathic_abilities');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintSpecies(4, 'Gravity-Defying Tree', [
      { trait: 'height', value: '100m' },
      { trait: 'root_system', value: 'minimal' }
    ], 9, 'creator4');
    expect(() => transferSpecies(id, 'unauthorized_user', 'newowner2')).toThrow('Not authorized');
  });
  
  it('should not allow unauthorized evolutions', () => {
    const id = mintSpecies(5, 'Quantum Butterfly', [
      { trait: 'wing_span', value: '10cm' },
      { trait: 'probability_shift', value: 'medium' }
    ], 10, 'creator5');
    const newTraits = [
      { trait: 'wing_span', value: '15cm' },
      { trait: 'probability_shift', value: 'high' }
    ];
    expect(() => evolveSpecies(id, newTraits, 'unauthorized_user')).toThrow('Not authorized');
  });
});

