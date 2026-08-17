// Quick-reference index of ECHR and UNCRC rights.
// Full legislation:
//   ECHR  -> https://www.echr.coe.int/documents/d/echr/convention_eng
//   UNCRC -> https://www.ohchr.org/sites/default/files/crc.pdf

export type RightRef = {
  instrument: 'ECHR' | 'UNCRC';
  article: string;
  right: string;
  link: string;
};

const ECHR_LINK = 'https://www.echr.coe.int/documents/d/echr/convention_eng';
const UNCRC_LINK = 'https://www.ohchr.org/sites/default/files/crc.pdf';

export const rightsIndex: RightRef[] = [
  { instrument: 'ECHR', article: 'Article 2', right: 'Right to life', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 3', right: 'Prohibition of torture', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 4', right: 'Prohibition of slavery and forced labour', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 5', right: 'Right to liberty and security', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 6', right: 'Right to a fair trial', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 7', right: 'No punishment without law', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 8', right: 'Right to respect for private and family life', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 9', right: 'Freedom of thought, conscience and religion', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 10', right: 'Freedom of expression', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 11', right: 'Freedom of assembly and association', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 12', right: 'Right to marry', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 13', right: 'Right to an effective remedy', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 14', right: 'Prohibition of discrimination', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 15', right: 'Derogation in time of emergency', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 16', right: 'Restrictions on political activity of aliens', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 17', right: 'Prohibition of abuse of rights', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Article 18', right: 'Limitation on use of restrictions on rights', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 1, Art. 1', right: 'Protection of property', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 1, Art. 2', right: 'Right to education', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 1, Art. 3', right: 'Right to free elections', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 4, Art. 1', right: 'Prohibition of imprisonment for debt', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 4, Art. 2', right: 'Freedom of movement', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 4, Art. 3', right: 'Prohibition of expulsion of nationals', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 4, Art. 4', right: 'Prohibition of collective expulsion of aliens', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 6, Art. 1', right: 'Abolition of the death penalty', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 7, Art. 1', right: 'Procedural safeguards relating to expulsion of aliens', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 7, Art. 2', right: 'Right of appeal in criminal matters', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 7, Art. 3', right: 'Compensation for wrongful conviction', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 7, Art. 4', right: 'Right not to be tried or punished twice', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 7, Art. 5', right: 'Equality between spouses', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 12, Art. 1', right: 'General prohibition of discrimination', link: ECHR_LINK },
  { instrument: 'ECHR', article: 'Protocol 13, Art. 1', right: 'Abolition of the death penalty in all circumstances', link: ECHR_LINK },
  { instrument: 'UNCRC', article: 'Article 1', right: 'Definition of the child (under 18)', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 2', right: 'Non-discrimination', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 3', right: 'Best interests of the child', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 5', right: 'Parental guidance and the child\'s evolving capacities', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 6', right: 'Right to life, survival and development', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 7', right: 'Registration, name, nationality and care', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 8', right: 'Preservation of identity', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 9', right: 'Separation from parents', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 10', right: 'Family reunification', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 12', right: 'Respect for the views of the child', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 13', right: 'Freedom of expression', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 14', right: 'Freedom of thought, conscience and religion', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 15', right: 'Freedom of association', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 16', right: 'Protection of privacy', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 18', right: 'Parental responsibilities and State assistance', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 19', right: 'Protection from abuse and neglect', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 20', right: 'Children deprived of family environment', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 21', right: 'Adoption', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 22', right: 'Refugee children', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 23', right: 'Rights of disabled children', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 24', right: 'Right to health', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 25', right: 'Periodic review of placement', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 26', right: 'Right to social security', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 27', right: 'Right to an adequate standard of living', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 28', right: 'Right to education', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 29', right: 'Aims of education', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 30', right: 'Children of minorities or indigenous peoples', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 31', right: 'Right to rest, play and leisure', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 32', right: 'Protection from economic exploitation', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 33', right: 'Protection from drug abuse', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 34', right: 'Protection from sexual exploitation and abuse', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 35', right: 'Prevention of abduction, sale and trafficking', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 37', right: 'Protection from torture and deprivation of liberty', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 38', right: 'Protection in armed conflict', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 39', right: 'Recovery and reintegration of child victims', link: UNCRC_LINK },
  { instrument: 'UNCRC', article: 'Article 40', right: 'Rights of children in the justice system', link: UNCRC_LINK },
];
