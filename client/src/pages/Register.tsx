import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { Briefcase, Search, Building2, Handshake, TrendingUp, ArrowRight, ArrowLeft, CheckCircle, Circle } from "lucide-react";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", 
  "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", 
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", 
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", 
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", 
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", 
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", 
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", 
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", 
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const roles = [
  {
    id: "professional",
    icon: Briefcase,
    title: "Professional",
    description: "Network, showcase skills, and gain career visibility",
  },
  {
    id: "jobSeeker",
    icon: Search,
    title: "Job Seeker",
    description: "Actively looking for jobs locally or internationally",
  },
  {
    id: "employer",
    icon: Building2,
    title: "Employer",
    description: "Post job openings and find qualified candidates",
  },
  {
    id: "businessOwner",
    icon: Handshake,
    title: "Business Owner",
    description: "Seek partnerships, expansion support, and investors",
  },
  {
    id: "investor",
    icon: TrendingUp,
    title: "Investor",
    description: "Invest in startups, SMEs, and market opportunities",
  },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "Saudi Arabia",
    city: "",
    languages: "",
    headline: "",
    bio: "",
    linkedinUrl: "",
    websiteUrl: "",
    portfolioUrl: "",
  });

  const [selectedRoles, setSelectedRoles] = useState({
    professional: false,
    jobSeeker: false,
    employer: false,
    businessOwner: false,
    investor: false,
  });

  const handleRoleToggle = (roleId: keyof typeof selectedRoles) => {
    setSelectedRoles((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  const handleBasicInfoChange = (field: string, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (basicInfo.password !== basicInfo.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!Object.values(selectedRoles).some((v) => v)) {
      toast({
        title: "Error",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profileData: any = {};
      
      if (basicInfo.phone?.trim()) profileData.phone = basicInfo.phone.trim();
      if (basicInfo.country) profileData.country = basicInfo.country;
      if (basicInfo.city?.trim()) profileData.city = basicInfo.city.trim();
      if (basicInfo.languages?.trim()) {
        const languagesArray = basicInfo.languages.split(",").map(l => l.trim()).filter(Boolean);
        if (languagesArray.length > 0) profileData.languages = languagesArray;
      }
      if (basicInfo.headline?.trim()) profileData.headline = basicInfo.headline.trim();
      if (basicInfo.bio?.trim()) profileData.bio = basicInfo.bio.trim();
      if (basicInfo.linkedinUrl?.trim()) profileData.linkedinUrl = basicInfo.linkedinUrl.trim();
      if (basicInfo.websiteUrl?.trim()) profileData.websiteUrl = basicInfo.websiteUrl.trim();
      if (basicInfo.portfolioUrl?.trim()) profileData.portfolioUrl = basicInfo.portfolioUrl.trim();
      
      await register(
        basicInfo.email.trim(), 
        basicInfo.password, 
        basicInfo.fullName.trim(), 
        selectedRoles,
        profileData
      );

      toast({
        title: "Registration Successful!",
        description: "Please log in to access your dashboard.",
      });

      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasSelectedRoles = Object.values(selectedRoles).some((v) => v);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl">Join Professional Executive Forum</CardTitle>
              <p className="text-muted-foreground">
                Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Select Your Roles" : "Review & Submit"}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          required
                          value={basicInfo.fullName}
                          onChange={(e) => handleBasicInfoChange("fullName", e.target.value)}
                          data-testid="input-full-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={basicInfo.email}
                          onChange={(e) => handleBasicInfoChange("email", e.target.value)}
                          data-testid="input-email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={basicInfo.password}
                          onChange={(e) => handleBasicInfoChange("password", e.target.value)}
                          data-testid="input-password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          value={basicInfo.confirmPassword}
                          onChange={(e) => handleBasicInfoChange("confirmPassword", e.target.value)}
                          data-testid="input-confirm-password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={basicInfo.phone}
                          onChange={(e) => handleBasicInfoChange("phone", e.target.value)}
                          data-testid="input-phone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          required
                          value={basicInfo.country}
                          onValueChange={(value) => handleBasicInfoChange("country", value)}
                        >
                          <SelectTrigger id="country" data-testid="select-country">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country} data-testid={`option-country-${country.toLowerCase().replace(/\s+/g, '-')}`}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={basicInfo.city}
                          onChange={(e) => handleBasicInfoChange("city", e.target.value)}
                          data-testid="input-city"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="languages">Languages (comma-separated)</Label>
                        <Input
                          id="languages"
                          placeholder="English, Arabic, Urdu"
                          value={basicInfo.languages}
                          onChange={(e) => handleBasicInfoChange("languages", e.target.value)}
                          data-testid="input-languages"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="headline">Professional Headline</Label>
                      <Input
                        id="headline"
                        placeholder="e.g., Senior Software Engineer | Tech Entrepreneur"
                        value={basicInfo.headline}
                        onChange={(e) => handleBasicInfoChange("headline", e.target.value)}
                        data-testid="input-headline"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Short Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Brief description about yourself..."
                        rows={4}
                        value={basicInfo.bio}
                        onChange={(e) => handleBasicInfoChange("bio", e.target.value)}
                        data-testid="input-bio"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                        <Input
                          id="linkedinUrl"
                          type="url"
                          placeholder="https://linkedin.com/in/yourname"
                          value={basicInfo.linkedinUrl}
                          onChange={(e) => handleBasicInfoChange("linkedinUrl", e.target.value)}
                          data-testid="input-linkedin"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input
                          id="websiteUrl"
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={basicInfo.websiteUrl}
                          onChange={(e) => handleBasicInfoChange("websiteUrl", e.target.value)}
                          data-testid="input-website"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                        <Input
                          id="portfolioUrl"
                          type="url"
                          placeholder="https://portfolio.com"
                          value={basicInfo.portfolioUrl}
                          onChange={(e) => handleBasicInfoChange("portfolioUrl", e.target.value)}
                          data-testid="input-portfolio"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        size="lg"
                        data-testid="button-next-step"
                      >
                        Next: Select Roles
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">Select Your Roles</h3>
                      <p className="text-muted-foreground">
                        Choose any combination that fits your needs. You can select multiple roles.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRoles[role.id as keyof typeof selectedRoles];

                        return (
                          <Card
                            key={role.id}
                            className={`cursor-pointer transition-all border-2 hover-elevate ${
                              isSelected ? "border-primary bg-primary/5" : "border-border"
                            }`}
                            onClick={() => handleRoleToggle(role.id as keyof typeof selectedRoles)}
                            data-testid={`card-role-${role.id}`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                                {isSelected ? (
                                  <CheckCircle className="w-6 h-6 text-primary" data-testid={`checkbox-${role.id}`} />
                                ) : (
                                  <Circle className="w-6 h-6 text-muted-foreground" data-testid={`checkbox-${role.id}`} />
                                )}
                              </div>
                              <h4 className="font-bold mb-2">{role.title}</h4>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {!hasSelectedRoles && (
                      <p className="text-center text-destructive text-sm">
                        Please select at least one role to continue
                      </p>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        data-testid="button-back"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!hasSelectedRoles}
                        size="lg"
                        data-testid="button-next-review"
                      >
                        Review & Submit
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">Review Your Information</h3>
                      <p className="text-muted-foreground">
                        Please verify your details before submitting
                      </p>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Name:</strong> {basicInfo.fullName}</p>
                        <p><strong>Email:</strong> {basicInfo.email}</p>
                        <p><strong>Country:</strong> {basicInfo.country}</p>
                        {basicInfo.city && <p><strong>City:</strong> {basicInfo.city}</p>}
                        {basicInfo.headline && <p><strong>Headline:</strong> {basicInfo.headline}</p>}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Selected Roles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedRoles)
                            .filter(([, isSelected]) => isSelected)
                            .map(([roleId]) => {
                              const role = roles.find((r) => r.id === roleId);
                              return role ? (
                                <div
                                  key={roleId}
                                  className="bg-primary/10 text-primary px-4 py-2 rounded-md font-medium"
                                >
                                  {role.title}
                                </div>
                              ) : null;
                            })}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Note:</strong> Your registration will be reviewed by our admin team. You will receive an email notification once your account is approved.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        data-testid="button-back-to-roles"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        data-testid="button-submit-registration"
                      >
                        {loading ? "Submitting..." : "Submit Registration"}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline font-semibold">
                Login here
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
