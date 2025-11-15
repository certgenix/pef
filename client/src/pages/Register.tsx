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

const countryPhoneCodes: Record<string, string> = {
  "Afghanistan": "+93", "Albania": "+355", "Algeria": "+213", "Andorra": "+376", "Angola": "+244",
  "Antigua and Barbuda": "+1-268", "Argentina": "+54", "Armenia": "+374", "Australia": "+61", "Austria": "+43",
  "Azerbaijan": "+994", "Bahamas": "+1-242", "Bahrain": "+973", "Bangladesh": "+880", "Barbados": "+1-246",
  "Belarus": "+375", "Belgium": "+32", "Belize": "+501", "Benin": "+229", "Bhutan": "+975",
  "Bolivia": "+591", "Bosnia and Herzegovina": "+387", "Botswana": "+267", "Brazil": "+55", "Brunei": "+673",
  "Bulgaria": "+359", "Burkina Faso": "+226", "Burundi": "+257", "Cabo Verde": "+238", "Cambodia": "+855",
  "Cameroon": "+237", "Canada": "+1", "Central African Republic": "+236", "Chad": "+235", "Chile": "+56",
  "China": "+86", "Colombia": "+57", "Comoros": "+269", "Congo": "+242", "Costa Rica": "+506",
  "Croatia": "+385", "Cuba": "+53", "Cyprus": "+357", "Czech Republic": "+420", "Denmark": "+45",
  "Djibouti": "+253", "Dominica": "+1-767", "Dominican Republic": "+1-809", "Ecuador": "+593", "Egypt": "+20",
  "El Salvador": "+503", "Equatorial Guinea": "+240", "Eritrea": "+291", "Estonia": "+372", "Eswatini": "+268",
  "Ethiopia": "+251", "Fiji": "+679", "Finland": "+358", "France": "+33", "Gabon": "+241",
  "Gambia": "+220", "Georgia": "+995", "Germany": "+49", "Ghana": "+233", "Greece": "+30",
  "Grenada": "+1-473", "Guatemala": "+502", "Guinea": "+224", "Guinea-Bissau": "+245", "Guyana": "+592",
  "Haiti": "+509", "Honduras": "+504", "Hungary": "+36", "Iceland": "+354", "India": "+91",
  "Indonesia": "+62", "Iran": "+98", "Iraq": "+964", "Ireland": "+353", "Israel": "+972",
  "Italy": "+39", "Jamaica": "+1-876", "Japan": "+81", "Jordan": "+962", "Kazakhstan": "+7",
  "Kenya": "+254", "Kiribati": "+686", "Kosovo": "+383", "Kuwait": "+965", "Kyrgyzstan": "+996",
  "Laos": "+856", "Latvia": "+371", "Lebanon": "+961", "Lesotho": "+266", "Liberia": "+231",
  "Libya": "+218", "Liechtenstein": "+423", "Lithuania": "+370", "Luxembourg": "+352", "Madagascar": "+261",
  "Malawi": "+265", "Malaysia": "+60", "Maldives": "+960", "Mali": "+223", "Malta": "+356",
  "Marshall Islands": "+692", "Mauritania": "+222", "Mauritius": "+230", "Mexico": "+52", "Micronesia": "+691",
  "Moldova": "+373", "Monaco": "+377", "Mongolia": "+976", "Montenegro": "+382", "Morocco": "+212",
  "Mozambique": "+258", "Myanmar": "+95", "Namibia": "+264", "Nauru": "+674", "Nepal": "+977",
  "Netherlands": "+31", "New Zealand": "+64", "Nicaragua": "+505", "Niger": "+227", "Nigeria": "+234",
  "North Korea": "+850", "North Macedonia": "+389", "Norway": "+47", "Oman": "+968", "Pakistan": "+92",
  "Palau": "+680", "Palestine": "+970", "Panama": "+507", "Papua New Guinea": "+675", "Paraguay": "+595",
  "Peru": "+51", "Philippines": "+63", "Poland": "+48", "Portugal": "+351", "Qatar": "+974",
  "Romania": "+40", "Russia": "+7", "Rwanda": "+250", "Saint Kitts and Nevis": "+1-869", "Saint Lucia": "+1-758",
  "Saint Vincent and the Grenadines": "+1-784", "Samoa": "+685", "San Marino": "+378", "Sao Tome and Principe": "+239",
  "Saudi Arabia": "+966", "Senegal": "+221", "Serbia": "+381", "Seychelles": "+248", "Sierra Leone": "+232",
  "Singapore": "+65", "Slovakia": "+421", "Slovenia": "+386", "Solomon Islands": "+677", "Somalia": "+252",
  "South Africa": "+27", "South Korea": "+82", "South Sudan": "+211", "Spain": "+34", "Sri Lanka": "+94",
  "Sudan": "+249", "Suriname": "+597", "Sweden": "+46", "Switzerland": "+41", "Syria": "+963",
  "Taiwan": "+886", "Tajikistan": "+992", "Tanzania": "+255", "Thailand": "+66", "Timor-Leste": "+670",
  "Togo": "+228", "Tonga": "+676", "Trinidad and Tobago": "+1-868", "Tunisia": "+216", "Turkey": "+90",
  "Turkmenistan": "+993", "Tuvalu": "+688", "Uganda": "+256", "Ukraine": "+380", "United Arab Emirates": "+971",
  "United Kingdom": "+44", "United States": "+1", "Uruguay": "+598", "Uzbekistan": "+998", "Vanuatu": "+678",
  "Vatican City": "+39", "Venezuela": "+58", "Vietnam": "+84", "Yemen": "+967", "Zambia": "+260", "Zimbabwe": "+263"
};

// Create unique phone code entries with representative countries
const uniquePhoneCodes = [
  { code: "+1", label: "+1 (USA, Canada)" },
  { code: "+7", label: "+7 (Russia, Kazakhstan)" },
  { code: "+20", label: "+20 (Egypt)" },
  { code: "+27", label: "+27 (South Africa)" },
  { code: "+30", label: "+30 (Greece)" },
  { code: "+31", label: "+31 (Netherlands)" },
  { code: "+32", label: "+32 (Belgium)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+34", label: "+34 (Spain)" },
  { code: "+36", label: "+36 (Hungary)" },
  { code: "+39", label: "+39 (Italy)" },
  { code: "+40", label: "+40 (Romania)" },
  { code: "+41", label: "+41 (Switzerland)" },
  { code: "+43", label: "+43 (Austria)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+45", label: "+45 (Denmark)" },
  { code: "+46", label: "+46 (Sweden)" },
  { code: "+47", label: "+47 (Norway)" },
  { code: "+48", label: "+48 (Poland)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+51", label: "+51 (Peru)" },
  { code: "+52", label: "+52 (Mexico)" },
  { code: "+53", label: "+53 (Cuba)" },
  { code: "+54", label: "+54 (Argentina)" },
  { code: "+55", label: "+55 (Brazil)" },
  { code: "+56", label: "+56 (Chile)" },
  { code: "+57", label: "+57 (Colombia)" },
  { code: "+58", label: "+58 (Venezuela)" },
  { code: "+60", label: "+60 (Malaysia)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+62", label: "+62 (Indonesia)" },
  { code: "+63", label: "+63 (Philippines)" },
  { code: "+64", label: "+64 (New Zealand)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+66", label: "+66 (Thailand)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+82", label: "+82 (South Korea)" },
  { code: "+84", label: "+84 (Vietnam)" },
  { code: "+86", label: "+86 (China)" },
  { code: "+90", label: "+90 (Turkey)" },
  { code: "+91", label: "+91 (India)" },
  { code: "+92", label: "+92 (Pakistan)" },
  { code: "+93", label: "+93 (Afghanistan)" },
  { code: "+94", label: "+94 (Sri Lanka)" },
  { code: "+95", label: "+95 (Myanmar)" },
  { code: "+98", label: "+98 (Iran)" },
  { code: "+212", label: "+212 (Morocco)" },
  { code: "+213", label: "+213 (Algeria)" },
  { code: "+216", label: "+216 (Tunisia)" },
  { code: "+218", label: "+218 (Libya)" },
  { code: "+220", label: "+220 (Gambia)" },
  { code: "+221", label: "+221 (Senegal)" },
  { code: "+222", label: "+222 (Mauritania)" },
  { code: "+223", label: "+223 (Mali)" },
  { code: "+224", label: "+224 (Guinea)" },
  { code: "+225", label: "+225 (Ivory Coast)" },
  { code: "+226", label: "+226 (Burkina Faso)" },
  { code: "+227", label: "+227 (Niger)" },
  { code: "+228", label: "+228 (Togo)" },
  { code: "+229", label: "+229 (Benin)" },
  { code: "+230", label: "+230 (Mauritius)" },
  { code: "+231", label: "+231 (Liberia)" },
  { code: "+232", label: "+232 (Sierra Leone)" },
  { code: "+233", label: "+233 (Ghana)" },
  { code: "+234", label: "+234 (Nigeria)" },
  { code: "+235", label: "+235 (Chad)" },
  { code: "+236", label: "+236 (Central African Republic)" },
  { code: "+237", label: "+237 (Cameroon)" },
  { code: "+238", label: "+238 (Cabo Verde)" },
  { code: "+239", label: "+239 (Sao Tome and Principe)" },
  { code: "+240", label: "+240 (Equatorial Guinea)" },
  { code: "+241", label: "+241 (Gabon)" },
  { code: "+242", label: "+242 (Congo)" },
  { code: "+244", label: "+244 (Angola)" },
  { code: "+245", label: "+245 (Guinea-Bissau)" },
  { code: "+248", label: "+248 (Seychelles)" },
  { code: "+249", label: "+249 (Sudan)" },
  { code: "+250", label: "+250 (Rwanda)" },
  { code: "+251", label: "+251 (Ethiopia)" },
  { code: "+252", label: "+252 (Somalia)" },
  { code: "+253", label: "+253 (Djibouti)" },
  { code: "+254", label: "+254 (Kenya)" },
  { code: "+255", label: "+255 (Tanzania)" },
  { code: "+256", label: "+256 (Uganda)" },
  { code: "+257", label: "+257 (Burundi)" },
  { code: "+258", label: "+258 (Mozambique)" },
  { code: "+260", label: "+260 (Zambia)" },
  { code: "+261", label: "+261 (Madagascar)" },
  { code: "+262", label: "+262 (Réunion)" },
  { code: "+263", label: "+263 (Zimbabwe)" },
  { code: "+264", label: "+264 (Namibia)" },
  { code: "+265", label: "+265 (Malawi)" },
  { code: "+266", label: "+266 (Lesotho)" },
  { code: "+267", label: "+267 (Botswana)" },
  { code: "+268", label: "+268 (Eswatini)" },
  { code: "+269", label: "+269 (Comoros)" },
  { code: "+290", label: "+290 (Saint Helena)" },
  { code: "+291", label: "+291 (Eritrea)" },
  { code: "+297", label: "+297 (Aruba)" },
  { code: "+298", label: "+298 (Faroe Islands)" },
  { code: "+299", label: "+299 (Greenland)" },
  { code: "+350", label: "+350 (Gibraltar)" },
  { code: "+351", label: "+351 (Portugal)" },
  { code: "+352", label: "+352 (Luxembourg)" },
  { code: "+353", label: "+353 (Ireland)" },
  { code: "+354", label: "+354 (Iceland)" },
  { code: "+355", label: "+355 (Albania)" },
  { code: "+356", label: "+356 (Malta)" },
  { code: "+357", label: "+357 (Cyprus)" },
  { code: "+358", label: "+358 (Finland)" },
  { code: "+359", label: "+359 (Bulgaria)" },
  { code: "+370", label: "+370 (Lithuania)" },
  { code: "+371", label: "+371 (Latvia)" },
  { code: "+372", label: "+372 (Estonia)" },
  { code: "+373", label: "+373 (Moldova)" },
  { code: "+374", label: "+374 (Armenia)" },
  { code: "+375", label: "+375 (Belarus)" },
  { code: "+376", label: "+376 (Andorra)" },
  { code: "+377", label: "+377 (Monaco)" },
  { code: "+378", label: "+378 (San Marino)" },
  { code: "+380", label: "+380 (Ukraine)" },
  { code: "+381", label: "+381 (Serbia)" },
  { code: "+382", label: "+382 (Montenegro)" },
  { code: "+383", label: "+383 (Kosovo)" },
  { code: "+385", label: "+385 (Croatia)" },
  { code: "+386", label: "+386 (Slovenia)" },
  { code: "+387", label: "+387 (Bosnia and Herzegovina)" },
  { code: "+389", label: "+389 (North Macedonia)" },
  { code: "+420", label: "+420 (Czech Republic)" },
  { code: "+421", label: "+421 (Slovakia)" },
  { code: "+423", label: "+423 (Liechtenstein)" },
  { code: "+501", label: "+501 (Belize)" },
  { code: "+502", label: "+502 (Guatemala)" },
  { code: "+503", label: "+503 (El Salvador)" },
  { code: "+504", label: "+504 (Honduras)" },
  { code: "+505", label: "+505 (Nicaragua)" },
  { code: "+506", label: "+506 (Costa Rica)" },
  { code: "+507", label: "+507 (Panama)" },
  { code: "+509", label: "+509 (Haiti)" },
  { code: "+591", label: "+591 (Bolivia)" },
  { code: "+592", label: "+592 (Guyana)" },
  { code: "+593", label: "+593 (Ecuador)" },
  { code: "+595", label: "+595 (Paraguay)" },
  { code: "+597", label: "+597 (Suriname)" },
  { code: "+598", label: "+598 (Uruguay)" },
  { code: "+670", label: "+670 (Timor-Leste)" },
  { code: "+672", label: "+672 (Antarctica)" },
  { code: "+673", label: "+673 (Brunei)" },
  { code: "+674", label: "+674 (Nauru)" },
  { code: "+675", label: "+675 (Papua New Guinea)" },
  { code: "+676", label: "+676 (Tonga)" },
  { code: "+677", label: "+677 (Solomon Islands)" },
  { code: "+678", label: "+678 (Vanuatu)" },
  { code: "+679", label: "+679 (Fiji)" },
  { code: "+680", label: "+680 (Palau)" },
  { code: "+682", label: "+682 (Cook Islands)" },
  { code: "+683", label: "+683 (Niue)" },
  { code: "+685", label: "+685 (Samoa)" },
  { code: "+686", label: "+686 (Kiribati)" },
  { code: "+687", label: "+687 (New Caledonia)" },
  { code: "+688", label: "+688 (Tuvalu)" },
  { code: "+689", label: "+689 (French Polynesia)" },
  { code: "+690", label: "+690 (Tokelau)" },
  { code: "+691", label: "+691 (Micronesia)" },
  { code: "+692", label: "+692 (Marshall Islands)" },
  { code: "+850", label: "+850 (North Korea)" },
  { code: "+852", label: "+852 (Hong Kong)" },
  { code: "+853", label: "+853 (Macau)" },
  { code: "+855", label: "+855 (Cambodia)" },
  { code: "+856", label: "+856 (Laos)" },
  { code: "+880", label: "+880 (Bangladesh)" },
  { code: "+886", label: "+886 (Taiwan)" },
  { code: "+960", label: "+960 (Maldives)" },
  { code: "+961", label: "+961 (Lebanon)" },
  { code: "+962", label: "+962 (Jordan)" },
  { code: "+963", label: "+963 (Syria)" },
  { code: "+964", label: "+964 (Iraq)" },
  { code: "+965", label: "+965 (Kuwait)" },
  { code: "+966", label: "+966 (Saudi Arabia)" },
  { code: "+967", label: "+967 (Yemen)" },
  { code: "+968", label: "+968 (Oman)" },
  { code: "+970", label: "+970 (Palestine)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+972", label: "+972 (Israel)" },
  { code: "+973", label: "+973 (Bahrain)" },
  { code: "+974", label: "+974 (Qatar)" },
  { code: "+975", label: "+975 (Bhutan)" },
  { code: "+976", label: "+976 (Mongolia)" },
  { code: "+977", label: "+977 (Nepal)" },
  { code: "+992", label: "+992 (Tajikistan)" },
  { code: "+993", label: "+993 (Turkmenistan)" },
  { code: "+994", label: "+994 (Azerbaijan)" },
  { code: "+995", label: "+995 (Georgia)" },
  { code: "+996", label: "+996 (Kyrgyzstan)" },
  { code: "+998", label: "+998 (Uzbekistan)" },
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
    phoneCode: "+966",
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
    if (field === "country") {
      // Also update phone code when country changes
      const phoneCode = countryPhoneCodes[value] || "+1";
      setBasicInfo((prev) => ({ ...prev, country: value, phoneCode }));
    } else {
      setBasicInfo((prev) => ({ ...prev, [field]: value }));
    }
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
      
      if (basicInfo.phone?.trim()) profileData.phone = `${basicInfo.phoneCode} ${basicInfo.phone.trim()}`;
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

  const validateBasicInfo = () => {
    if (!basicInfo.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }

    if (!basicInfo.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }

    if (!basicInfo.password) {
      toast({
        title: "Validation Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return false;
    }

    if (!basicInfo.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please confirm your password",
        variant: "destructive",
      });
      return false;
    }

    if (basicInfo.password !== basicInfo.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (!basicInfo.country) {
      toast({
        title: "Validation Error",
        description: "Please select your country",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateBasicInfo()) {
      setStep(2);
    }
  };

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
                        <div className="flex gap-2">
                          <Select
                            value={basicInfo.phoneCode}
                            onValueChange={(value) => handleBasicInfoChange("phoneCode", value)}
                          >
                            <SelectTrigger className="w-[140px]" data-testid="select-phone-code">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {uniquePhoneCodes.map((item) => (
                                <SelectItem key={item.code} value={item.code} data-testid={`option-phone-code-${item.code.replace(/[^0-9]/g, '')}`}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id="phone"
                            type="tel"
                            className="flex-1"
                            placeholder="12 345 6789"
                            value={basicInfo.phone}
                            onChange={(e) => handleBasicInfoChange("phone", e.target.value)}
                            data-testid="input-phone"
                          />
                        </div>
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
                        onClick={handleNextStep}
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
