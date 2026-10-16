{/* Login button with tracking */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] active:scale-[0.99] text-white font-black rounded-xl text-sm transition-all cursor-pointer shadow-3xs flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            id="login-submit-btn"
            onClick={() => trackFeature('login', 'click')}
          >
            <Sparkles className="w-4.5 h-4.5 text-white" />
            <span>
              {isLoading
                ? (lang === "en" ? "Please wait..." : "សូមរង់ចាំ...")
                : authMode === 'login'
                ? (lang === "en" ? "Sign In to Passport" : "ចូលគណនីលិខិតឆ្លងដែន")
                : (lang === "en" ? "Create Account & Start" : "បង្កើតគណនី & ចាប់ផ្តើម")
            </span>
          </button>

          {/* Register mode tracking */}
          {authMode === 'register' && (
            <button
              type="button"
              onClick={() => trackFeature('register', 'click')}
              className="w-full py-2.5 border-2 border-[#2F6F8F] hover:bg-[#AEE3D8]/20 text-[#2F6F8F] font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
              id="switch-to-register-btn"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Create Account' : 'ចុះឈ្មោះថ្មី'}
              </span>
            </button>
          )}