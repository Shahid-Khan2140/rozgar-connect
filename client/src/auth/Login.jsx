import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css"; 
import { API_URL } from "../config";

// --- IMPORT ASSETS (IMAGES) ---
// Ensure these images exist in your 'src/assets/' folder
// --- IMPORT ASSETS (IMAGES) ---
// High-quality images now used directly via URL for better performance and consistency

// ==========================================
// 1. OTP SUB-COMPONENT (UI)
// ==========================================
// This component handles the OTP input display and timer logic
const OtpSection = ({ target, onResend, otp, setOtp, timer }) => (
  <div className="otp-section animate-pop-in">
    {/* Security Icon Animation */}
    <div className="security-icon pulse-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="30">
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    </div>

    <h3 className="otp-title">Authentication Required</h3>
    <p className="otp-subtitle">
      Code sent to <span className="email-highlight">{target}</span>
    </p>

    {/* OTP Input Field */}
    <div className="otp-input-wrapper">
      <input 
        type="text" 
        className="otp-input-styled" 
        placeholder="0 0 0 0 0 0" 
        value={otp} 
        onChange={(e) => { 
          // Only allow numbers and max 6 digits
          if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
            setOtp(e.target.value); 
          }
        }}
        autoFocus
        required
      />
    </div>

    {/* Timer / Resend Link */}
    <div className={`timer-badge ${timer < 10 && timer > 0 ? "pulse-red" : ""}`}>
      {timer > 0 ? ( 
        <span>Expires in {timer}s</span> 
      ) : ( 
        <span className="resend-link" onClick={onResend}>Resend Code</span> 
      )}
    </div>
  </div>
);

// ==========================================
// 2. MAIN LOGIN COMPONENT
// ==========================================
const Login = () => {
  // --- STATE VARIABLES ---
  const [view, setView] = useState("login"); // Controls active form: 'login', 'register', 'forgot'
  
  // Form Fields
  const [identifier, setIdentifier] = useState(""); // Email/Phone for Login
  const [email, setEmail] = useState("");           // Email for Register
  const [phone, setPhone] = useState("");           // Phone for Register
  const [role, setRole] = useState("labour");       // Role Selection
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // OTP State
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false); // Toggles OTP view
  const [timer, setTimer] = useState(0); 
  
  // UI State
  const [currentIndex, setCurrentIndex] = useState(0); // Slider index
  const [message, setMessage] = useState({ text: "", type: "" }); // Error/Success messages
  
  // Role State (Default: Labour)


  const navigate = useNavigate();



  // --- SLIDER CONTENT DATA ---
  // --- SLIDER CONTENT DATA ---
  const getSliderContent = () => {
    if (role === 'contractor') {
      return [
        {
          image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop", 
          title: "Build Your Dream Team",
          quote: "Hire the best skilled labor for your projects."
        },
        {
          image: "https://images.unsplash.com/photo-1564069114423-47e54093e54e?q=80&w=2070&auto=format&fit=crop",
          title: "Manage Projects Efficiently",
          quote: "Track progress, assign jobs, and grow your business."
        },
        {
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
            title: "Construction & Development",
            quote: "The right workers for the right job, instantly."
        }
      ];
    }
    if (role === 'developer') {
        return [
          {
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop", // Tech/Code image
            title: "System Administration",
            quote: "Control policies, users, and platform integrity."
          },
          {
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", // Data/Analytics
            title: "Data & Analytics",
            quote: "Monitor real-time statistics and user growth."
          },
          {
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop", // Security
            title: "Secure Infrastructure",
            quote: "Ensuring a safe and reliable environment for all."
          }
        ];
    }
    // Default: Labour
    // Default: Labour
    return [
      {
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop",
        title: "Construction & Infrastructure",
        quote: "Secure jobs for skilled and unskilled workers."
      },
      {
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1779&auto=format&fit=crop",
        title: "Agricultural Support",
        quote: "Empowering the farming backbone of our nation."
      },
      {
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
        title: "Industrial Growth",
        quote: "Connecting factory workers with opportunities."
      },
      {
        image: "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?q=80&w=2070&auto=format&fit=crop",
        title: <>Welcome to <span style={{color: '#ff9800'}}>રોજગાર</span> Connect</>,
        quote: "Government portal for labor welfare and growth."
      }
    ];
  };

  const sliderContent = getSliderContent();

  // --- EFFECT: AUTO-SLIDE IMAGES ---
  useEffect(() => {
    setCurrentIndex(0); // Reset to first slide when role/content changes
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderContent.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [sliderContent.length, role]);

  // --- EFFECT: OTP TIMER COUNTDOWN ---
  useEffect(() => {
    let interval;
    if (timer > 0) { 
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000); 
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- HELPER: RESET FORM STATE ---
  const switchView = (newView) => {
    setView(newView); 
    setMessage({ text: "", type: "" }); 
    setShowOtpInput(false); 
    setOtp(""); 
    setTimer(0);
    // Only clear password when switching back to login to prevent frustration
    if(newView === 'login') { setPassword(""); }
  };

  // --- API ACTION: SEND OTP ---
  const handleSendOtp = async (targetIdentifier, type) => {
    try {
      setMessage({ text: "Sending verification code...", type: "info" });
      
      // Call Backend API
      await axios.post(`${API_URL}/api/send-otp`, { 
        identifier: targetIdentifier, 
        type 
      });
      
      setMessage({ text: "", type: "" }); // Clear loading message
      setShowOtpInput(true); // Show OTP Input
      setTimer(60); // Start 60s timer
    } catch (err) { 
      // Handle Errors
      const errorMsg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setMessage({ text: errorMsg, type: "error" }); 
    }
  };

  // --- FORM SUBMIT: LOGIN (Direct - No OTP) ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // We now use the direct login route without OTP
    try {
      const res = await axios.post(`${API_URL}/api/login`, { 
        identifier, 
        password,
        role // Optional: Backend could check if role matches, but strictly we just log in the user
      });
      
      if (res.data.message === "Login Successful" || res.data.message.includes("success")) { 
          // 1. Save User Data to LocalStorage
          localStorage.setItem("user", JSON.stringify(res.data.user)); 
          
          // 2. Redirect to Dashboard
          navigate("/labour/dashboard"); 
      }
    } catch (err) { 
      // Handle Invalid Password / User Not Found
      setMessage({ text: err.response?.data?.message || "Invalid Credentials", type: "error" }); 
    }
  };

  // --- FORM SUBMIT: REGISTER (With OTP) ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Password Validation
    if (password !== confirmPassword) { 
      setMessage({ text: "Passwords do not match!", type: "error" }); 
      return; 
    }
    
    // 2. Step 1: Send OTP (If not already sent)
    if (!showOtpInput) {
      if(!email) return setMessage({ text: "Email is required for OTP", type: "error" });
      await handleSendOtp(email, "register");
    } 
    // 3. Step 2: Verify OTP & Create Account
    else {
      try {
        await axios.post(`${API_URL}/api/register`, { 
          email, 
          phone, 
          password, 

          role, // Send Role
          otp 
        });
        
        // Success!
        setMessage({ text: "Account Created Successfully! Redirecting...", type: "success" }); 
        
        // Redirect to Login after 2 seconds
        setTimeout(() => switchView("login"), 2000);
      } catch (err) { 
        setMessage({ text: err.response?.data?.message || "Registration Failed", type: "error" }); 
      }
    }
  };

  // --- FORM SUBMIT: RESET PASSWORD ---
  const handleReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "error" });
      return;
    }

    try {
      await axios.post(`${API_URL}/api/reset-password`, { 
        identifier, 
        newPassword: password 
      });
      
      setMessage({ text: "Password Reset Successful!", type: "success" }); 
      setTimeout(() => switchView("login"), 2000);
    } catch (err) { 
      setMessage({ text: "User not found or Error Occurred", type: "error" }); 
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="login-page-wrapper">
      <div className="login-split-container">
        
        {/* =========================================
            LEFT SIDE: FORMS
           ========================================= */}
        <div className="login-form-side">
          
          {/* Brand Logo / Title */}
          <div className="login-brand stagger-1">
            <div>
              <h2 className="brand-title">
                <span style={{ color: "#ff9800", fontWeight: "bold" }}>રોજગાર</span> Connect
              </h2>
              <p className="brand-subtitle">Government of Gujarat</p>
            </div>
          </div>

          {/* Role Selector Tabs (Text Only - Professional) */}
          <div className="role-selector stagger-1">
             <button 
               type="button"
               className={`role-tab ${role === 'labour' ? 'active' : ''}`}
               onClick={() => setRole('labour')}
             >
               Laborer
             </button>
             <button 
               type="button"
               className={`role-tab ${role === 'contractor' ? 'active' : ''}`}
               onClick={() => setRole('contractor')}
             >
               Contractor
             </button>
             <button 
               type="button"
               className={`role-tab ${role === 'developer' ? 'active' : ''}`}
               onClick={() => setRole('developer')}
             >
               Admin
             </button>
          </div>

          {/* Alert Message Box */}
          {message.text && (
            <div className={`message-box ${message.type} stagger-2`}>
              {message.text}
            </div>
          )}

          {/* -----------------------------
              VIEW 1: LOGIN FORM
             ----------------------------- */}
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="form-animate">
              <div className="form-header stagger-2">
                <h1>Welcome Back</h1>
                <p>Please enter your details to continue.</p>
              </div>

              {/* Login Inputs */}
              <div className={`input-modern stagger-3 ${identifier ? "has-value" : ""}`}>
                <input 
                  type="text" 
                  placeholder=" " 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  required 
                />
                <label>Email or Mobile Number</label>
              </div>
              <div className={`input-modern stagger-4 ${password ? "has-value" : ""}`}>
                <input 
                  type="password" 
                  placeholder=" " 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <label>Password</label>
              </div>

              {/* Login Button */}
              <button type="submit" className="btn-modern btn-primary stagger-5">
                Secure Login
              </button>

              {/* Footer Links */}
              <div className="auth-links stagger-6">
                <span onClick={() => switchView("register")}>Create Account</span>
                <span onClick={() => switchView("forgot")}>Forgot Password?</span>
              </div>
            </form>
          )}

          {/* -----------------------------
              VIEW 2: REGISTRATION FORM
             ----------------------------- */}
          {view === "register" && (
            <form onSubmit={handleRegisterSubmit} className="form-animate">
              <div className="form-header stagger-2">
                <h1>{showOtpInput ? "Verify Account" : "Create Account"}</h1>
                <p>Join the largest labor welfare network.</p>
              </div>
              
              {!showOtpInput ? (
                <>
                  {/* Step 1 Inputs */}
                  <div className={`input-modern stagger-3 ${email ? "has-value" : ""}`}>
                    <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <label>Email Address</label>
                  </div>
                  <div className={`input-modern stagger-4 ${phone ? "has-value" : ""}`}>
                    <input type="tel" placeholder=" " value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    <label>Mobile Number</label>
                  </div>
                  <div className={`input-modern stagger-5 ${password ? "has-value" : ""}`}>
                    <input type="password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <label>Create Password</label>
                  </div>
                  <div className={`input-modern stagger-6 ${confirmPassword ? "has-value" : ""}`}>
                    <input type="password" placeholder=" " value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <label>Confirm Password</label>
                  </div>
                  {/* Role is now handled by the top selector, so we hide/disable the select or sync it */}
                  <input type="hidden" value={role} />
                  
                  <button type="submit" className="btn-modern btn-green stagger-7">
                    Get OTP & Register as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                  
                  <div className="auth-links stagger-8">
                    <span>Already have an account?</span> 
                    <span onClick={() => switchView("login")} className="link-highlight">Login</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: OTP Verification */}
                  <OtpSection 
                    target={email} 
                    onResend={() => handleSendOtp(email, "register")} 
                    otp={otp} 
                    setOtp={setOtp} 
                    timer={timer} 
                  />
                  <button type="submit" className="btn-modern btn-green">
                    Verify & Register
                  </button>
                  <div className="auth-links">
                    <span onClick={() => { setShowOtpInput(false); setOtp(""); }}>
                      Back to Details
                    </span>
                  </div>
                </>
              )}
            </form>
          )}

          {/* -----------------------------
              VIEW 3: FORGOT PASSWORD FORM
             ----------------------------- */}
          {view === "forgot" && (
            <form onSubmit={handleReset} className="form-animate">
              <div className="form-header stagger-2">
                <h1>Reset Password</h1>
                <p>Enter your details to set a new password.</p>
              </div>
              <div className={`input-modern stagger-3 ${identifier ? "has-value" : ""}`}>
                <input type="text" placeholder=" " value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                <label>Email or Mobile</label>
              </div>
              <div className={`input-modern stagger-4 ${password ? "has-value" : ""}`}>
                <input type="password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label>New Password</label>
              </div>
              <div className={`input-modern stagger-5 ${confirmPassword ? "has-value" : ""}`}>
                <input type="password" placeholder=" " value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <label>Confirm Password</label>
              </div>
              <button type="submit" className="btn-modern btn-orange stagger-6">
                Reset Password
              </button>
              <div className="auth-links stagger-7">
                <span onClick={() => switchView("login")}>Back to Login</span>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="login-footer stagger-8">
            <p>© 2026 <span style={{ color: "#ff9800", fontWeight: "bold" }}>રોજગાર</span> Connect.</p>
            <p className="dev-credit">Designed by <span className="dev-name">Shahid Khan</span></p>
          </div>
        </div>

        {/* =========================================
            RIGHT SIDE: IMAGE SLIDER
           ========================================= */}
        <div className="login-image-side">
          {/* UNIFIED SLIDER VIEW FOR ALL ROLES */}
          {sliderContent.map((content, index) => (
            <div 
              key={`${role}-${index}`} // Force re-render on role change
              className={`slide-item ${index === currentIndex ? "active" : ""}`}
            >
              <img src={content.image} alt={content.title} className="bg-image" />
              <div className="slide-overlay">
                <h2>{content.title}</h2>
                <p>{content.quote}</p>
              </div>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="slide-indicators">
            {sliderContent.map((_, index) => (
              <span 
                key={index} 
                className={index === currentIndex ? "active" : ""} 
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;