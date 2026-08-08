import React from "react";

const AuthContainer = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/25 to-cyan-50 center py-5 md:py-10 px-6 md:px-8">
      <div className="w-full max-w-md">
        <div className="md:rounded-3xl md:border border-slate-200 md:bg-white md:p-8 md:shadow-xl shadow-slate-200/60">
          <div className="mb-10">
            <img src="/logo.png" className="h-12 object-contain mb-2" />
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
