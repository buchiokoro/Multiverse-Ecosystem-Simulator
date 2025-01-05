import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let modelCount = 0;
let predictionCount = 0;
const aiModels = new Map();
const ecosystemPredictions = new Map();

// Simulated contract functions
function registerAIModel(name: string, description: string, version: string, creator: string) {
  const modelId = ++modelCount;
  aiModels.set(modelId, { creator, name, description, version });
  return modelId;
}

function createEcosystemPrediction(modelId: number, ecosystemId: number, predictionData: string) {
  if (!aiModels.has(modelId)) throw new Error('Invalid model');
  const predictionId = ++predictionCount;
  ecosystemPredictions.set(predictionId, {
    modelId,
    ecosystemId,
    predictionData,
    timestamp: Date.now(),
    status: 'pending'
  });
  return predictionId;
}

function validatePrediction(predictionId: number, isValid: boolean, validator: string) {
  if (validator !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  const prediction = ecosystemPredictions.get(predictionId);
  if (!prediction) throw new Error('Invalid prediction');
  prediction.status = isValid ? 'validated' : 'rejected';
  ecosystemPredictions.set(predictionId, prediction);
  return true;
}

describe('AI Integration Contract', () => {
  beforeEach(() => {
    modelCount = 0;
    predictionCount = 0;
    aiModels.clear();
    ecosystemPredictions.clear();
  });
  
  it('should register a new AI model', () => {
    const id = registerAIModel('EcoEvolver v1', 'Predicts ecosystem evolution', '1.0.0', 'creator1');
    expect(id).toBe(1);
    const model = aiModels.get(id);
    expect(model.name).toBe('EcoEvolver v1');
    expect(model.version).toBe('1.0.0');
  });
  
  it('should create an ecosystem prediction', () => {
    const modelId = registerAIModel('SpeciesInteraction v2', 'Models species interactions', '2.1.0', 'creator2');
    const predictionId = createEcosystemPrediction(modelId, 1, '{"biodiversity_index": 0.85, "stability_score": 0.92}');
    expect(predictionId).toBe(1);
    const prediction = ecosystemPredictions.get(predictionId);
    expect(prediction.modelId).toBe(modelId);
    expect(prediction.status).toBe('pending');
  });
  
  it('should validate a prediction', () => {
    const modelId = registerAIModel('ClimateShift v3', 'Predicts climate changes', '3.0.1', 'creator3');
    const predictionId = createEcosystemPrediction(modelId, 2, '{"temperature_change": 1.5, "precipitation_change": -50}');
    expect(validatePrediction(predictionId, true, 'CONTRACT_OWNER')).toBe(true);
    const prediction = ecosystemPredictions.get(predictionId);
    expect(prediction.status).toBe('validated');
  });
  
  it('should not allow creating predictions with invalid models', () => {
    expect(() => createEcosystemPrediction(999, 3, '{"data": "invalid"}')).toThrow('Invalid model');
  });
  
  it('should not allow unauthorized prediction validations', () => {
    const modelId = registerAIModel('EcoBalance v4', 'Analyzes ecosystem balance', '4.2.0', 'creator4');
    const predictionId = createEcosystemPrediction(modelId, 4, '{"balance_score": 0.78, "intervention_needed": false}');
    expect(() => validatePrediction(predictionId, true, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should handle multiple predictions for the same ecosystem', () => {
    const modelId1 = registerAIModel('ShortTermPredictor', 'Short-term ecosystem changes', '1.0.0', 'creator5');
    const modelId2 = registerAIModel('LongTermPredictor', 'Long-term ecosystem changes', '1.0.0', 'creator5');
    
    const predictionId1 = createEcosystemPrediction(modelId1, 5, '{"short_term_changes": {"biodiversity": -0.02, "biomass": +0.05}}');
    const predictionId2 = createEcosystemPrediction(modelId2, 5, '{"long_term_changes": {"biodiversity": +0.1, "biomass": -0.15}}');
    
    expect(predictionId1).not.toBe(predictionId2);
    expect(ecosystemPredictions.get(predictionId1).ecosystemId).toBe(5);
    expect(ecosystemPredictions.get(predictionId2).ecosystemId).toBe(5);
  });
});

