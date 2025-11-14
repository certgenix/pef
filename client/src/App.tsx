import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Membership from "@/pages/Membership";
import Opportunities from "@/pages/Opportunities";
import News from "@/pages/News";
import Contact from "@/pages/Contact";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import CompleteProfile from "@/pages/CompleteProfile";
import Dashboard from "@/pages/Dashboard";
import ProfessionalDashboard from "@/pages/dashboards/ProfessionalDashboard";
import JobSeekerDashboard from "@/pages/dashboards/JobSeekerDashboard";
import EmployerDashboard from "@/pages/dashboards/EmployerDashboard";
import BusinessOwnerDashboard from "@/pages/dashboards/BusinessOwnerDashboard";
import InvestorDashboard from "@/pages/dashboards/InvestorDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/membership" component={Membership} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/news" component={News} />
      <Route path="/contact" component={Contact} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/complete-profile" component={CompleteProfile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/professional" component={ProfessionalDashboard} />
      <Route path="/dashboard/job-seeker" component={JobSeekerDashboard} />
      <Route path="/dashboard/employer" component={EmployerDashboard} />
      <Route path="/dashboard/business-owner" component={BusinessOwnerDashboard} />
      <Route path="/dashboard/investor" component={InvestorDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
