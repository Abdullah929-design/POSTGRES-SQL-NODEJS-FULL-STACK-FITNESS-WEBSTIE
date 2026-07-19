import { useState } from "react";

// Kinetic theme tokens (aligned with the rest of the app)
const KINETIC = {
  surface: '#0c0f0f',
  surfaceContainer: '#1e2020',
  surfaceContainerLow: '#121414',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#c8c6c5',
  primary: '#ff571a',
  primarySoft: '#ffb59e',
  primaryHover: '#e64a12',
  outline: 'rgba(255, 255, 255, 0.1)',
  error: '#ff8a80',
};

function Bmi() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [message, setMessage] = useState('');
  const [nutritionData, setNutritionData] = useState(null);

  const generateNutritionRecommendations = (bmiValue, weightKg, heightInches) => {
    const heightCm = heightInches * 2.54;

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    // Assuming average age of 30 and moderate activity level
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * 30 + 5; // for males
    const dailyCalories = Math.round(bmr * 1.55); // moderate activity multiplier

    // Calculate macronutrient recommendations
    let proteinGrams, carbsGrams, fatsGrams;

    if (bmiValue < 18.5) {
      // Underweight - higher calories for weight gain
      const targetCalories = dailyCalories + 500;
      proteinGrams = Math.round(weightKg * 1.6);
      carbsGrams = Math.round((targetCalories * 0.5) / 4);
      fatsGrams = Math.round((targetCalories * 0.3) / 9);
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      // Normal - maintenance calories
      proteinGrams = Math.round(weightKg * 1.2);
      carbsGrams = Math.round((dailyCalories * 0.5) / 4);
      fatsGrams = Math.round((dailyCalories * 0.3) / 9);
    } else {
      // Overweight/Obese - deficit for weight loss
      const targetCalories = dailyCalories - 500;
      proteinGrams = Math.round(weightKg * 1.4);
      carbsGrams = Math.round((targetCalories * 0.4) / 4);
      fatsGrams = Math.round((targetCalories * 0.3) / 9);
    }

    setNutritionData({
      dailyCalories,
      macronutrients: {
        protein: proteinGrams,
        carbs: carbsGrams,
        fats: fatsGrams
      }
    });
  };

  const calcBmi = () => {
    // Reset previous results
    setNutritionData(null);

    // Check if weight and height are valid numbers
    if (isNaN(weight) || isNaN(height) || weight === '' || height === '') {
      setMessage("Please enter a valid weight and height");
      setBmi('');
      return;
    }

    // Check if weight and height are positive
    if (weight <= 0 || height <= 0) {
      setMessage("Please enter a positive weight and height");
      setBmi('');
      return;
    }

    const heightInMeters = height * 0.0254;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(1));

    if (bmiValue < 18.5) {
      setMessage('You are Underweight');
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setMessage('You are Normal')
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setMessage('You are Overweight')
    } else {
      setMessage('You are Obese')
    }

    // Generate nutrition recommendations based on BMI
    generateNutritionRecommendations(bmiValue, parseFloat(weight), parseFloat(height));
  }

  const reload = () => {
    setWeight('');
    setHeight('');
    setBmi('');
    setMessage('');
    setNutritionData(null);
  }

  const getBmiColor = () => {
    if (!bmi) return KINETIC.onSurfaceVariant;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return '#60a5fa';
    if (bmiValue < 25) return '#4ade80';
    if (bmiValue < 30) return '#facc15';
    return '#f87171';
  }

  const getNutritionRecommendation = () => {
    if (!nutritionData) return null;

    const bmiValue = parseFloat(bmi);
    let recommendation = '';

    if (bmiValue < 18.5) {
      recommendation = {
        title: 'Weight Gain Recommendation',
        details: 'Focus on calorie-dense foods and increase protein intake to build healthy muscle mass. Include nuts, avocados, whole grains, and lean proteins.',
        tips: ['Eat 5-6 small meals per day', 'Add healthy fats to meals', 'Include protein shakes', 'Focus on strength training']
      };
    } else if (bmiValue < 25) {
      recommendation = {
        title: 'Maintenance Recommendation',
        details: 'Maintain your current healthy diet with balanced macronutrients. Continue with a variety of fruits, vegetables, lean proteins, and whole grains.',
        tips: ['Eat a balanced diet', 'Stay hydrated', 'Regular exercise', 'Get adequate sleep']
      };
    } else {
      recommendation = {
        title: 'Weight Loss Recommendation',
        details: 'Focus on nutrient-dense, lower calorie foods and create a moderate calorie deficit. Emphasize vegetables, lean proteins, and complex carbohydrates.',
        tips: ['Reduce portion sizes', 'Increase vegetable intake', 'Choose lean proteins', 'Stay active daily']
      };
    }

    const panelBg = 'rgba(255, 255, 255, 0.05)';
    const panelBorder = `1px solid ${KINETIC.outline}`;

    return (
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ color: KINETIC.onSurface, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '8px' }}>{recommendation.title}</h4>
        <p style={{ color: KINETIC.onSurfaceVariant, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', marginBottom: '12px' }}>{recommendation.details}</p>

        {/* Daily Calories */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: KINETIC.onSurface, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '8px' }}>Daily Calorie Target</h4>
          <div style={{
            background: panelBg,
            border: panelBorder,
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <p style={{ color: KINETIC.primarySoft, fontSize: '24px', fontWeight: 'bold', fontFamily: "'Space Grotesk', sans-serif" }}>{nutritionData.dailyCalories} calories</p>
          </div>
        </div>

        {/* Macronutrients */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: KINETIC.onSurface, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '8px' }}>Daily Macronutrients</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: panelBg,
            border: panelBorder,
            padding: '12px',
            borderRadius: '4px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: KINETIC.onSurfaceVariant, fontSize: '12px', fontFamily: "'Hanken Grotesk', sans-serif" }}>Protein</p>
              <p style={{ color: KINETIC.onSurface, fontWeight: '600', fontSize: '18px', fontFamily: "'Space Grotesk', sans-serif" }}>{nutritionData.macronutrients.protein}g</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: KINETIC.onSurfaceVariant, fontSize: '12px', fontFamily: "'Hanken Grotesk', sans-serif" }}>Carbs</p>
              <p style={{ color: KINETIC.onSurface, fontWeight: '600', fontSize: '18px', fontFamily: "'Space Grotesk', sans-serif" }}>{nutritionData.macronutrients.carbs}g</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: KINETIC.onSurfaceVariant, fontSize: '12px', fontFamily: "'Hanken Grotesk', sans-serif" }}>Fats</p>
              <p style={{ color: KINETIC.onSurface, fontWeight: '600', fontSize: '18px', fontFamily: "'Space Grotesk', sans-serif" }}>{nutritionData.macronutrients.fats}g</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <h4 style={{ color: KINETIC.onSurface, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '8px' }}>Key Tips</h4>
          <div style={{
            background: panelBg,
            border: panelBorder,
            padding: '12px',
            borderRadius: '4px'
          }}>
            {recommendation.tips.map((tip, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{
                  width: '4px',
                  height: '4px',
                  background: KINETIC.primary,
                  borderRadius: '50%',
                  marginRight: '8px'
                }}></div>
                <p style={{ color: KINETIC.onSurfaceVariant, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: `1px solid ${KINETIC.outline}`,
    borderRadius: '4px',
    color: KINETIC.onSurface,
    fontSize: '16px',
    fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    color: KINETIC.onSurfaceVariant,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  };

  const primaryBtn = {
    flex: 1,
    background: `linear-gradient(45deg, ${KINETIC.primary} 0%, #ff8a00 90%)`,
    color: 'white',
    padding: '14px 24px',
    borderRadius: '4px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 87, 26, 0.35)',
    transition: 'all 0.2s ease-out',
  };

  const ghostBtn = {
    padding: '14px 24px',
    background: 'transparent',
    border: `1px solid ${KINETIC.outline}`,
    color: KINETIC.onSurface,
    borderRadius: '4px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.2s ease-out',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${KINETIC.surface} 0%, ${KINETIC.surfaceContainerLow} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Hanken Grotesk', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Atmospheric kinetic glows */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(255, 87, 26, 0.18) 0%, rgba(255, 87, 26, 0) 70%)',
        filter: 'blur(20px)', borderRadius: '50%',
      }}></div>
      <div style={{
        position: 'absolute', bottom: '10%', right: '8%', width: '360px', height: '360px',
        background: 'radial-gradient(circle, rgba(255, 181, 158, 0.12) 0%, rgba(255, 181, 158, 0) 70%)',
        filter: 'blur(20px)', borderRadius: '50%',
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '28rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          position: 'relative',
          background: 'rgba(30, 32, 32, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '4px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '40px',
          border: `1px solid ${KINETIC.outline}`,
        }}>
          {/* Brand wordmark */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '34px',
              fontWeight: 900,
              fontStyle: 'italic',
              color: KINETIC.primarySoft,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}>
              KINETIC
            </span>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '30px', fontWeight: 900, fontStyle: 'italic',
              color: KINETIC.onSurface, marginBottom: '8px',
              textTransform: 'uppercase', letterSpacing: '-0.02em',
            }}>BMI Calculator</h1>
            <p style={{ color: KINETIC.onSurfaceVariant, fontSize: '15px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Track your health journey
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Weight Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyle}>Weight (Kgs)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  placeholder="Enter your weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${KINETIC.primarySoft}`; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '14px',
                  color: KINETIC.onSurfaceVariant,
                  fontSize: '14px',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  kg
                </div>
              </div>
            </div>

            {/* Height Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyle}>Height (Inches)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  placeholder="Enter your height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${KINETIC.primarySoft}`; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '14px',
                  color: KINETIC.onSurfaceVariant,
                  fontSize: '14px',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  in
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
              <button
                onClick={calcBmi}
                style={primaryBtn}
                onMouseOver={(e) => { e.target.style.background = `linear-gradient(45deg, ${KINETIC.primaryHover} 0%, #e67c00 90%)`; }}
                onMouseOut={(e) => { e.target.style.background = `linear-gradient(45deg, ${KINETIC.primary} 0%, #ff8a00 90%)`; }}
              >
                Calculate BMI
              </button>
              <button
                onClick={reload}
                style={ghostBtn}
                onMouseOver={(e) => { e.target.style.borderColor = KINETIC.primary; e.target.style.color = KINETIC.primarySoft; }}
                onMouseOut={(e) => { e.target.style.borderColor = KINETIC.outline; e.target.style.color = KINETIC.onSurface; }}
              >
                Reset
              </button>
            </div>

            {/* Results */}
            {(bmi || message) && (
              <div style={{
                marginTop: '32px',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                border: `1px solid ${KINETIC.outline}`,
              }}>
                <div style={{ textAlign: 'center' }}>
                  {bmi && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        color: KINETIC.onSurfaceVariant,
                        fontSize: '14px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        marginBottom: '4px'
                      }}>Your BMI is</p>
                      <p style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: getBmiColor(),
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}>{bmi}</p>
                    </div>
                  )}
                  {message && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      background: 'rgba(255, 87, 26, 0.12)',
                      borderRadius: '4px'
                    }}>
                      <span style={{
                        color: KINETIC.primarySoft,
                        fontWeight: 600,
                        fontFamily: "'Hanken Grotesk', sans-serif"
                      }}>{message}</span>
                    </div>
                  )}
                  {nutritionData && getNutritionRecommendation()}
                </div>
              </div>
            )}
          </div>

          {/* BMI Scale Reference */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            border: `1px solid ${KINETIC.outline}`
          }}>
            <h3 style={{
              color: KINETIC.onSurface,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>BMI Scale Reference</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', background: '#60a5fa', borderRadius: '50%', marginRight: '8px' }}></div>
                <span style={{ color: KINETIC.onSurfaceVariant, fontFamily: "'Hanken Grotesk', sans-serif" }}>Underweight (&lt;18.5)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', marginRight: '8px' }}></div>
                <span style={{ color: KINETIC.onSurfaceVariant, fontFamily: "'Hanken Grotesk', sans-serif" }}>Normal (18.5-24.9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', background: '#facc15', borderRadius: '50%', marginRight: '8px' }}></div>
                <span style={{ color: KINETIC.onSurfaceVariant, fontFamily: "'Hanken Grotesk', sans-serif" }}>Overweight (25-29.9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '50%', marginRight: '8px' }}></div>
                <span style={{ color: KINETIC.onSurfaceVariant, fontFamily: "'Hanken Grotesk', sans-serif" }}>Obese (≥30)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder {
          color: rgba(226, 226, 226, 0.4);
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}

export default Bmi;
