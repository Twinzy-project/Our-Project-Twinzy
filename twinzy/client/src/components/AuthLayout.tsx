import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-accent p-4">
      <div className="max-w-md mx-auto bg-white bg-opacity-90 rounded-2xl shadow-xl overflow-hidden mt-10">
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-chart-line text-white text-xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Twinzy</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
