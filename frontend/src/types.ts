export interface Profile {
  id: string
  userId: string
  yearsExperience?: number
  currentCompany?: string
  targetCompanies: string[]
  salaryRangeMin?: number
  salaryRangeMax?: number
  bio?: string
  preferredActivities: string[]
  hasProfilePhoto?: boolean
  resumeLink?: string
  githubLink?: string
  skills: { skillId: string; skillName: string; proficiency?: string }[]
}

export interface Venue {
  id: string
  name: string
  address: string
}

export interface Match {
  id: string
  user1Id: string
  user2Id: string
  matchDate: string
  suggestedActivity: string
  status: string
  myVenueChoice?: string
  partnerVenueChoice?: string
  matchedWith?: {
    userId?: string
    displayName?: string
    bio?: string
    preferredActivities?: string[]
    hasProfilePhoto?: boolean
  }
}

export interface Referral {
  id: string
  referredName: string
  referredEmail: string
  referredPhone: string
  linkedinProfileLink: string
  resumeUrl: string
  status: string
  createdAt: string
}
