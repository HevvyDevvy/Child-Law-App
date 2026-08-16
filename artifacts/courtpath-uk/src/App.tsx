import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight,
  CircleHelp, Clock3, Download, FileCheck2, FileText, Gavel, Info,
  Landmark, Menu, Printer, Scale, ShieldCheck, Sparkles, Upload, X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

type Field = {
  id: string; label: string; help: string; required?: boolean;
  type?: 'text' | 'textarea' | 'date' | 'email' | 'select'; placeholder?: string;
  options?: string[]; warning?: string;
};
type Section = { id: string; title: string; intro: string; fields: Field[] };
type Template = {
  id: string; jurisdiction: 'Scotland' | 'England & Wales' | 'European Court of Human Rights';
  form: string; title: string; purpose: string; sourceFile: string; estimatedMinutes: number;
  caution: string; sections: Section[];
};
type Draft = {
  templateId: string; caseName: string; courtReference: string; applicant: string;
  respondent: string; child: string; dates: string; fieldValues: Record<string, string>;
  attachments: Record<string, boolean>; lastSavedAt: string;
};

const templates: Template[] = [
  {
    id: 'scot-6-2', jurisdiction: 'Scotland', form: 'Form 6.2', title: 'Note of Appeal',
    purpose: 'Prepare a structured note explaining the decision you are appealing and the numbered grounds for appeal.',
    sourceFile: 'Official_Form_6.2_Note_of_Appeal.docx', estimatedMinutes: 18,
    caution: 'This is a drafting companion. Check the current Sheriff Appeal Court form, rules and time limit before filing.',
    sections: [
      { id: 'case', title: 'Cause and parties', intro: 'Start with the identifiers exactly as they appear on the order or decision.', fields: [
        { id: 'court', label: 'Sheriff court, nature of decision and reference', help: 'State the sheriff court, what kind of decision is being appealed, and the court reference number.', required: true, placeholder: 'Example: Glasgow Sheriff Court — interlocutor on contact — F00/24' },
        { id: 'appellant', label: 'Pursuer and appellant', help: 'Use the party’s full designation and address, if required by the current form.', required: true, placeholder: 'Full legal name and address' },
        { id: 'respondent', label: 'Defender and respondent', help: 'Use the other party or parties’ full designation and address, if required.', required: true, placeholder: 'Full legal name and address' },
        { id: 'decisionDate', label: 'Date of decision being appealed', help: 'Use the date shown on the decision or interlocutor.', required: true, type: 'date' },
      ] },
      { id: 'grounds', title: 'Grounds of appeal', intro: 'Keep each ground focused on a specific alleged error. Separate facts you know from your view of the outcome.', fields: [
        { id: 'decision', label: 'Decision or order being appealed', help: 'Briefly state what the court decided.', required: true, type: 'textarea', placeholder: 'On [date], the court decided that…' },
        { id: 'grounds', label: 'Numbered grounds', help: 'Use one numbered ground per line. Avoid argument by insult or speculation.', required: true, type: 'textarea', placeholder: '1. The court…\n2. The court…', warning: 'Check every ground against the reasons for the decision and the current appeal rules.' },
        { id: 'orders', label: 'Orders sought', help: 'State the practical outcome you ask the appeal court to make.', required: true, type: 'textarea', placeholder: 'The appellant asks the court to…' },
      ] },
      { id: 'sheriff-note', title: 'Sheriff’s note', intro: 'Select or explain the position on the sheriff’s note setting out the reasons for the decision.', fields: [
        { id: 'sheriffNote', label: 'Availability of sheriff’s note', help: 'Say whether the note is appended, requested but unavailable, requested now, or whether the appeal is said to be urgent without it.', required: true, type: 'select', options: ['Note provided and appended', 'Requested but not yet available', 'Not provided — request the sheriff to write one', 'Urgent appeal requested without the note'] },
        { id: 'sheriffNoteReason', label: 'Reason or urgency explanation', help: 'If the note is unavailable, explain the request briefly in numbered points.', type: 'textarea', placeholder: 'The note is unavailable because… The appeal is urgent because…' },
      ] },
      { id: 'caseManagement', title: 'Initial case management', intro: 'Give your view on whether the appeal should proceed before one Appeal Sheriff or three Appeal Sheriffs.', fields: [
        { id: 'procedure', label: 'Preferred procedure', help: 'Choose the procedure you ask the court to consider, taking account of the current rules.', required: true, type: 'select', options: ['Procedure before one Appeal Sheriff (Chapter 8)', 'Procedure before three Appeal Sheriffs (Chapter 7)', 'Not sure — seek advice'] },
        { id: 'procedureReasons', label: 'Reasons for that procedure', help: 'State briefly why that procedure is suitable, without arguing the whole appeal here.', type: 'textarea', placeholder: 'The appeal is suitable for this procedure because…' },
        { id: 'contact', label: 'Appellant contact and signature details', help: 'Use an address, email and telephone number where the court can contact you safely; add the signatory’s role or solicitor business address.', required: true, type: 'textarea', placeholder: 'Name, role, postal address, email, telephone and signature position' },
      ] },
    ],
  },
  {
    id: 'scot-6-5a', jurisdiction: 'Scotland', form: 'Form 6.5-A', title: 'Certificate of Intimation',
    purpose: 'Record how and when a document or decision was intimated to the relevant person.',
    sourceFile: 'Official_Form_6.5A_Certificate_of_Intimation.docx', estimatedMinutes: 10,
    caution: 'Confirm the permitted method, recipient and deadline with the current court rules or court office.',
    sections: [{ id: 'intimation', title: 'Intimation record', intro: 'Make the record precise. Keep proof of sending or service with your working papers.', fields: [
      { id: 'cause', label: 'Appeal cause and parties', help: 'Set out the pursuer/appellant and defender/respondent exactly as they appear in the appeal.', required: true, type: 'textarea', placeholder: 'Pursuer and appellant… against defender and respondent…' },
      { id: 'court', label: 'Court and court reference', help: 'Copy this from the case paperwork.', required: true, placeholder: 'Sheriff Appeal Court and reference' },
      { id: 'document', label: 'Document or matter intimated', help: 'Name the document or other matter being intimated.', required: true, placeholder: 'Name of document or matter' },
      { id: 'recipient', label: 'Person receiving intimation', help: 'Name the receiving party or person and their role.', required: true, placeholder: 'Name and role' },
      { id: 'method', label: 'Method of intimation', help: 'State the method authorised by the current rule. Do not assume email or post is sufficient.', required: true, type: 'select', options: ['Email', 'First-class post', 'Recorded delivery', 'Personal service', 'Other — verify'] },
      { id: 'date', label: 'Date of intimation', help: 'The date it was sent or delivered.', required: true, type: 'date' },
      { id: 'signatory', label: 'Certifying person and role', help: 'Identify the appellant/respondent, solicitor or sheriff officer certifying the intimation.', required: true, placeholder: 'Name and role' },
      { id: 'businessAddress', label: 'Business or postal address', help: 'Add the business address of the solicitor or sheriff officer where applicable.', type: 'textarea', placeholder: 'Address, email and telephone if relevant' },
      { id: 'proof', label: 'Proof kept', help: 'Describe the receipt, sent email, certificate or other evidence.', required: true, type: 'textarea', placeholder: 'I have kept…' },
    ] } ],
  },
  {
    id: 'scot-14-1', jurisdiction: 'Scotland', form: 'Form 14.1', title: 'Motion by Email',
    purpose: 'Organise a motion request to send by email where the current court procedure permits it.',
    sourceFile: 'Official_Form_14.1_Motion_by_Email.docx', estimatedMinutes: 15,
    caution: 'Email procedure, court address and response times can change. Verify them with the court before sending.',
    sections: [
      { id: 'motion', title: 'Motion by email', intro: 'Complete the email fields and describe the order requested precisely.', fields: [
        { id: 'courtEmail', label: 'Email address of the Sheriff Appeal Court', help: 'Use the current court email address, not an address copied from an old example.', required: true, type: 'email', placeholder: 'current court email address' },
        { id: 'caseName', label: 'Case name', help: 'Use the full cause name.', required: true, placeholder: 'A.B. against C.D.' },
        { id: 'court', label: 'Court reference number', help: 'Copy the reference exactly from the appeal paperwork.', required: true, placeholder: 'Appeal reference' },
        { id: 'nextSevenDays', label: 'Is the case in court in the next 7 days?', help: 'Answer based on the current court timetable.', required: true, type: 'select', options: ['Yes', 'No', 'Not known — check'] },
        { id: 'lodgingParty', label: 'Solicitor or party lodging the motion', help: 'Name and role of the person lodging it.', required: true, placeholder: 'Name and role' },
        { id: 'reference', label: 'Solicitor or party reference', help: 'Add the file or party reference if used.', placeholder: 'Reference' },
        { id: 'telephone', label: 'Telephone number', help: 'A number for the court or parties to use.', required: true, placeholder: 'Telephone number' },
        { id: 'email', label: 'Email address', help: 'A safe address for correspondence.', required: true, type: 'email', placeholder: 'name@example.org' },
        { id: 'lodgingOnBehalf', label: 'Lodging on behalf of', help: 'State the appellant, respondent or other party represented.', required: true, placeholder: 'Appellant / respondent' },
      ] },
      { id: 'request', title: 'Request and submissions', intro: 'Keep the motion focused on the order sought and the reason it is needed.', fields: [
        { id: 'position', label: 'Position of motion', help: 'Say whether the motion is opposed or unopposed, if known.', required: true, type: 'select', options: ['Unopposed', 'Opposed', 'Not known — check'] },
        { id: 'orders', label: 'Motion in brief terms', help: 'State one clear order or a short list of orders.', required: true, type: 'textarea', placeholder: 'The Court is asked to…' },
        { id: 'submissions', label: 'Submissions in support', help: 'Add concise factual or legal submissions only where required.', type: 'textarea', placeholder: 'The motion is supported because…' },
        { id: 'lodgingDate', label: 'Date of lodging', help: 'The date the motion will be lodged.', required: true, type: 'date' },
        { id: 'consent', label: 'Consent position', help: 'Record whether consent has been provided.', required: true, type: 'select', options: ['Consent provided', 'Consent not provided', 'Not known — check'] },
      ] },
      { id: 'intimation', title: 'Intimation and documents', intro: 'Record every receiving address and deadline needed for the email procedure.', fields: [
        { id: 'intimationTo', label: 'Intimation made to', help: 'List the party or parties receiving intimation.', required: true, placeholder: 'Names and roles' },
        { id: 'providedEmails', label: 'Provided email addresses', help: 'List the addresses supplied for intimation.', required: true, type: 'textarea', placeholder: 'party@example.org' },
        { id: 'additionalEmails', label: 'Additional fee-earner or case-handler addresses', help: 'Add any additional addresses where applicable.', type: 'textarea', placeholder: 'Additional addresses, or none' },
        { id: 'intimationDate', label: 'Date intimations sent', help: 'Date the motion and documents were sent.', required: true, type: 'date' },
        { id: 'oppositionDeadline', label: 'Last time and date for opposition', help: 'Record the deadline, including 17:00 where the current rule/form requires it.', required: true, placeholder: 'Date and time' },
        { id: 'documents', label: 'Documents intimated and lodged', help: 'List each document sent with the motion.', type: 'textarea', placeholder: 'Document title and date' },
      ] },
    ],
  },
  {
    id: 'scot-14-2', jurisdiction: 'Scotland', form: 'Form 14.2', title: 'Opposition to Motion by Email',
    purpose: 'Set out an opposition or response to a motion, including the position and any alternative order.',
    sourceFile: 'Official_Form_14.2_Opposition_to_Motion.docx', estimatedMinutes: 15,
    caution: 'Check the current opposition deadline and the exact email process. Keep the original motion and proof of receipt.',
    sections: [{ id: 'opposition', title: 'Opposition to motion by email', intro: 'Respond to the motion itself. Keep each point tied to a document or fact where possible.', fields: [
      { id: 'caseName', label: 'Case name', help: 'Use the full cause name.', required: true, placeholder: 'A.B. against C.D.' },
      { id: 'court', label: 'Court reference number', help: 'Identify the appeal exactly.', required: true, placeholder: 'Appeal reference' },
      { id: 'motionDate', label: 'Date motion was intimated', help: 'Use the date shown or the date you received the motion.', required: true, type: 'date' },
      { id: 'oppositionDate', label: 'Date opposition is intimated', help: 'The date this opposition is sent.', required: true, type: 'date' },
      { id: 'opponent', label: 'Solicitor or party opposing', help: 'Your name and role in the case.', required: true, placeholder: 'Name and role' },
      { id: 'reference', label: 'Solicitor or party reference', help: 'Add the file or party reference if used.', placeholder: 'Reference' },
      { id: 'telephone', label: 'Telephone number', help: 'A number for the court or parties to use.', required: true, placeholder: 'Telephone number' },
      { id: 'email', label: 'Email address', help: 'A safe address for correspondence.', required: true, type: 'email', placeholder: 'name@example.org' },
      { id: 'opposingOnBehalf', label: 'Opposing on behalf of', help: 'State the appellant, respondent or other party represented.', required: true, placeholder: 'Appellant / respondent' },
      { id: 'position', label: 'Grounds of opposition', help: 'Say whether you oppose all or part of the motion and give concise grounds.', required: true, type: 'textarea', placeholder: 'I oppose the motion because…' },
      { id: 'duration', label: 'Estimated duration of hearing', help: 'Give an estimate if a hearing is required.', placeholder: 'For example, 30 minutes' },
    ] } ],
  },
  {
    id: 'scot-15-1', jurisdiction: 'Scotland', form: 'Form 15.1', title: 'Form of Motion',
    purpose: 'Build a clear motion with the order sought, legal basis and supporting material.',
    sourceFile: 'Official_Form_15.1_Blank.docx', estimatedMinutes: 16,
    caution: 'The court may require a particular form or supporting documents. Check the current procedural rules.',
    sections: [{ id: 'motion', title: 'Form of motion', intro: 'Use plain, specific language. Explain the link between the facts and the order requested.', fields: [
      { id: 'caseName', label: 'Case name and cause', help: 'Set out the pursuer/appellant and defender/respondent as they appear in the appeal.', required: true, type: 'textarea', placeholder: 'In the appeal in the cause…' },
      { id: 'dateIntimation', label: 'Date of intimation', help: 'The date the motion is intimated.', required: true, type: 'date' },
      { id: 'court', label: 'Court and court reference', help: 'Identify the appeal.', required: true, placeholder: 'Sheriff Appeal Court and reference' },
      { id: 'party', label: 'Party presenting the motion', help: 'Name and role of the appellant or respondent.', required: true, placeholder: 'Name and role' },
      { id: 'orders', label: 'Orders sought', help: 'The exact order or orders requested.', required: true, type: 'textarea', placeholder: 'The court is asked to…' },
      { id: 'legalBasis', label: 'Legal or procedural basis', help: 'Name the rule, order or authority if known. Do not guess.', type: 'textarea', placeholder: 'The motion is made under…' },
      { id: 'facts', label: 'Grounds for the motion', help: 'State briefly, in numbered paragraphs, the facts supporting the order.', required: true, type: 'textarea', placeholder: '1. On [date]…\n2. The order is needed because…' },
      { id: 'oppositionDeadline', label: 'Last date for lodging opposition', help: 'Copy the deadline from the current rules or court direction.', required: true, type: 'date', warning: 'Do not calculate this from memory. Confirm the current deadline.' },
      { id: 'documents', label: 'Documents accompanying the motion', help: 'List each document attached or lodged with the motion.', type: 'textarea', placeholder: 'Document title and date, or none' },
      { id: 'signatory', label: 'Signatory and business address', help: 'Identify the appellant/respondent or solicitor and add the relevant business address.', required: true, type: 'textarea', placeholder: 'Name, role, signature position and business address' },
    ] } ],
  },
  {
    id: 'ew-c100', jurisdiction: 'England & Wales', form: 'C100', title: 'Child arrangements application',
    purpose: 'Prepare factual information for a child arrangements, prohibited steps or specific issue application before completing the current official C100.',
    sourceFile: 'C100 application form reference', estimatedMinutes: 25,
    caution: 'This is not the official C100. The court requires the current official form and may require a MIAM or a valid exemption.',
    sections: [
      { id: 'case', title: 'People and children', intro: 'Use the names and dates shown on official documents. Include only information needed for the application.', fields: [
        { id: 'applicant', label: 'Applicant name', help: 'Your full name and relationship to the child.', required: true, placeholder: 'Full name and relationship' },
        { id: 'respondent', label: 'Respondent name', help: 'The other person or people involved.', required: true, placeholder: 'Full name' },
        { id: 'child', label: 'Child or children', help: 'Names and dates of birth.', required: true, type: 'textarea', placeholder: 'Name — date of birth' },
        { id: 'court', label: 'Court or existing case reference', help: 'If known.', placeholder: 'Family Court / reference' },
      ] },
      { id: 'orders', title: 'What you are asking for', intro: 'Say what arrangement or decision would meet the child’s needs, without presenting assumptions as facts.', fields: [
        { id: 'orderType', label: 'Main application type', help: 'Choose the closest orientation; confirm on the official form.', required: true, type: 'select', options: ['Child arrangements', 'Prohibited steps', 'Specific issue', 'More than one type'] },
        { id: 'orders', label: 'Orders sought', help: 'Describe the proposed arrangements or decision.', required: true, type: 'textarea', placeholder: 'I ask the court to order…' },
        { id: 'childNeeds', label: 'Child’s needs and welfare', help: 'Focus on observable facts, routine, stability and the child’s wishes where appropriate.', required: true, type: 'textarea', placeholder: 'The child’s needs include…' },
        { id: 'miam', label: 'MIAM position', help: 'A MIAM is normally required before a C100 application unless an exemption applies. Record attendance, an appointment, or the exemption route.', required: true, type: 'select', options: ['MIAM attended — mediator confirmation available', 'MIAM appointment arranged', 'Exemption claimed — domestic abuse', 'Exemption claimed — risk of harm or child safety', 'Exemption claimed — urgency or child protection', 'Another exemption may apply — check current form', 'Not sure yet'] },
        { id: 'miamDetails', label: 'MIAM or exemption details', help: 'State the mediator/form confirmation or the facts supporting the exemption. Common examples are domestic abuse, risk of harm, urgency, child protection, or inability to attend; confirm the current C100 guidance.', required: true, type: 'textarea', placeholder: 'MIAM date and mediator / exemption category and supporting facts…', warning: 'Do not choose an exemption only because mediation feels difficult. Check the current rules and official C100 guidance.' },
      ] },
      { id: 'safeguarding', title: 'Safety and safeguarding', intro: 'Be direct about risks. If there is immediate danger, contact emergency services or a specialist service.', fields: [
        { id: 'safeguarding', label: 'Safeguarding concerns', help: 'Include relevant concerns about harm, abduction, coercive control or substance misuse. Detailed allegations usually belong in C1A.', required: true, type: 'textarea', placeholder: 'I am / am not aware of safeguarding concerns. The facts are…', warning: 'This draft cannot assess risk. Consider urgent legal advice and the official safeguarding questions.' },
        { id: 'support', label: 'Support or special arrangements needed', help: 'For example, an interpreter, accessibility adjustment or separate waiting area.', type: 'textarea', placeholder: 'I may need…' },
      ] },
    ],
  },
  {
    id: 'ew-c1a', jurisdiction: 'England & Wales', form: 'C1A', title: 'Safeguarding supplement',
    purpose: 'Organise allegations and safety information that may accompany a child arrangements application.',
    sourceFile: 'C1A safeguarding supplement reference', estimatedMinutes: 20,
    caution: 'Use the current C1A and follow its guidance. Do not use this tool instead of urgent advice where anyone is at risk.',
    sections: [
      { id: 'safety', title: 'Safeguarding information', intro: 'C1A is the supplement for allegations of harm or domestic abuse that may accompany C100. Separate what you personally saw, what someone told you, and what you are concerned may happen.', fields: [
        { id: 'applicant', label: 'Your name and role', help: 'Identify yourself in the case.', required: true, placeholder: 'Name and relationship' },
        { id: 'child', label: 'Child or children', help: 'Names and dates of birth.', required: true, placeholder: 'Child details' },
        { id: 'harmTypes', label: 'Types of harm or abuse', help: 'Select or describe each relevant category, such as domestic abuse, emotional harm, physical harm, sexual harm, neglect, drug or alcohol misuse, or abduction risk.', required: true, type: 'textarea', placeholder: 'Categories relevant to this application…' },
        { id: 'concerns', label: 'Specific incidents and dates', help: 'Describe incidents factually, with approximate dates, location and who was present where known.', required: true, type: 'textarea', placeholder: 'On or around [date], at [place]…' },
        { id: 'impact', label: 'Impact on the child or children', help: 'Explain the connection to the child’s safety or welfare, rather than only describing adult conflict.', required: true, type: 'textarea', placeholder: 'This may affect the child because…' },
        { id: 'involvement', label: 'Police, social care or other involvement', help: 'List reports, reference numbers, social-work involvement, medical evidence or protective agencies, if any.', type: 'textarea', placeholder: 'Organisation, date, reference and outcome' },
        { id: 'risk', label: 'Current or future risk', help: 'Explain any ongoing or anticipated risk and why.', required: true, type: 'textarea', placeholder: 'I am concerned that…' },
      ] },
      { id: 'protection', title: 'Protection and evidence', intro: 'Record existing safeguards and the material that may support your account. Keep originals securely and follow the official form’s instructions.', fields: [
        { id: 'orders', label: 'Protective arrangements requested', help: 'Describe the arrangement you ask the court to consider.', type: 'textarea', placeholder: 'I ask the court to consider…' },
        { id: 'existingSteps', label: 'Steps already taken', help: 'List any non-molestation order, injunction, supervised contact, safety plan or other protective step and its current status.', type: 'textarea', placeholder: 'Order or step, date and status' },
        { id: 'evidence', label: 'Documents or witnesses', help: 'List what may support the account. Do not attach originals to this draft.', type: 'textarea', placeholder: 'Document / witness / date / reference' },
        { id: 'specialMeasures', label: 'Safety or participation arrangements', help: 'Note any request for separate waiting, screens, remote attendance, an interpreter or other safety/access arrangement.', type: 'textarea', placeholder: 'I may need…' },
      ] },
    ],
  },
  {
    id: 'echr-readiness', jurisdiction: 'European Court of Human Rights', form: 'Article 34 / Rule 47', title: 'ECtHR application readiness',
    purpose: 'Organise the information for an Article 34 application before completing and sending the Court’s own official Rule 47 form.',
    sourceFile: 'ECHR Rule 47 public guidance', estimatedMinutes: 25,
    caution: 'Only the Court’s own official application form, completed and sent in accordance with Rule 47, stops the clock. Letters, emails or this checklist do not. Domestic remedies generally must be exhausted and the four-month deadline from the final domestic decision is strict.',
    sections: [
      { id: 'deadline', title: 'The four-month clock', intro: 'The application normally must reach the Court within four months of the final domestic decision. Confirm the current calculation immediately; this checklist cannot extend time.', fields: [
        { id: 'finalDecision', label: 'Final domestic decision date', help: 'The date of the final decision in the domestic process, not an earlier decision you disagree with.', required: true, type: 'date', warning: 'The four-month time limit is strict and not extended by sending a letter or incomplete application.' },
        { id: 'deadline', label: 'Four-month deadline calculated', help: 'Record the date you calculate and where you checked the current Court guidance.', required: true, type: 'date', warning: 'Check the calculation against the current official ECtHR guidance or obtain urgent legal advice.' },
        { id: 'officialFormPlan', label: 'Official form submission plan', help: 'Record when and how you will complete and send the Court’s own current Rule 47 application form.', required: true, type: 'textarea', placeholder: 'I will complete the Court’s official form and send it by…' },
      ] },
      { id: 'readiness', title: 'Article 34 applicant and remedies', intro: 'This is a readiness checklist only. It does not assess admissibility or decide whether a remedy was effective.', fields: [
      { id: 'applicant', label: 'Applicant name', help: 'Name of the person or organisation bringing the application.', required: true, placeholder: 'Full name' },
      { id: 'respondent', label: 'Respondent State', help: 'Usually the State you say is responsible.', required: true, placeholder: 'United Kingdom' },
      { id: 'victimStatus', label: 'Victim status and Article 34 position', help: 'Explain briefly how you say you are personally and directly affected, or why you are authorised to apply.', required: true, type: 'textarea', placeholder: 'I am personally and directly affected because…' },
      { id: 'complaint', label: 'Convention rights relied on and facts', help: 'State the Article(s) and a concise chronological account. Explain which decision or act is complained of.', required: true, type: 'textarea', placeholder: 'Article… The relevant facts are…' },
      { id: 'remedies', label: 'Domestic remedies exhausted', help: 'List each court, appeal, review or other effective remedy used, with dates and outcomes. If a remedy was not used, explain why and seek advice.', required: true, type: 'textarea', placeholder: 'Court / appeal / date / outcome…' },
      { id: 'exhaustion', label: 'Exhaustion check', help: 'Record why you believe effective domestic remedies have been exhausted. This app cannot decide whether an exception applies.', required: true, type: 'textarea', placeholder: 'The final effective domestic remedy was…' },
      { id: 'relief', label: 'What you ask the Court to do', help: 'Summarise the finding or just satisfaction you seek; the official form controls the final wording.', type: 'textarea', placeholder: 'I ask the Court to…' },
    ] },
      { id: 'documents', title: 'Documents for the official application', intro: 'The Court expects copies of relevant domestic decisions and supporting documents in the order required by its current instructions.', fields: [
        { id: 'documents', label: 'Documents available', help: 'List the domestic decisions, orders, judgments and other documents you will copy and label.', required: true, type: 'textarea', placeholder: '1. Decision dated…\n2. Appeal outcome dated…' },
        { id: 'formWarning', label: 'Why this checklist cannot stop the clock', help: 'Acknowledge that only the Court’s own official application form, completed and sent under Rule 47, can start the application process and stop the four-month deadline; a letter, email or CourtPath draft cannot.', required: true, type: 'select', options: ['I understand — I will use the Court’s official form', 'I need urgent advice before proceeding'] },
      ] },
    ],
  },
];

const rights = [
  ['Article 6', 'A fair hearing', 'Civil and family cases should be heard fairly, usually within a reasonable time, by an independent and impartial tribunal.'],
  ['Article 8', 'Private and family life', 'Family relationships, home and correspondence are protected. Any interference must have a lawful and proportionate basis.'],
  ['Article 13', 'An effective remedy', 'There should be a practical way to raise a serious Convention complaint before a national authority.'],
  ['Article 3', 'Protection from serious harm', 'Torture and inhuman or degrading treatment are prohibited. Urgent safety concerns need urgent specialist help.'],
  ['UNCRC Articles 3, 9, 12, 25', 'Children’s interests and voice', 'The child’s best interests, family contact, views and care or treatment should be considered in an age-appropriate way.'],
  ['Fairness in common law', 'A fair process', 'People should know the case against them, have a meaningful chance to respond and receive reasons for important decisions.'],
  ['Representation', 'Help in the hearing', 'A solicitor, barrister, law centre or legal clinic may help. A McKenzie Friend can sometimes provide quiet support, subject to the judge’s directions.'],
  ['Legal aid and information', 'Ask about eligibility', 'Legal aid depends on the issue, means and merits. Check GOV.UK, Civil Legal Advice, Citizens Advice, law centres and local clinics.'],
  ['SARs and Equality Act', 'Access and inclusion', 'A subject access request can help you obtain personal data. Equality law may require reasonable adjustments and protects against unlawful discrimination.'],
];

const iconForJurisdiction = (jurisdiction: Template['jurisdiction']) => jurisdiction === 'Scotland' ? <Landmark size={19} /> : jurisdiction === 'England & Wales' ? <Gavel size={19} /> : <Scale size={19} />;

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="min-h-[100dvh] bg-background">
    <header className="no-print sticky top-0 z-30 border-b border-border/80 bg-[hsl(var(--background)/.94)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 no-underline" data-testid="link-brand">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><Scale size={21} /></span>
          <span><span className="block font-display text-xl leading-none font-semibold tracking-tight">CourtPath</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.22em] text-muted-foreground">UK court companion</span></span>
        </Link>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(v => !v)} aria-label="Open navigation" data-testid="button-open-menu"><Menu size={22} /></button>
        <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-border bg-background px-5 py-4 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`} aria-label="Main navigation">
          <Link href="/rights" className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" data-testid="link-rights">Rights & support</Link>
          <Link href="/library" className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" data-testid="link-library">Document library</Link>
          <Link href="/" className="ml-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm hover:-translate-y-0.5 md:ml-2" data-testid="link-start">Start a draft</Link>
        </nav>
      </div>
    </header>
    <main>{children}</main>
    <footer className="no-print mt-20 border-t border-border bg-secondary/45">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between lg:px-8">
        <div><p className="font-display text-xl font-semibold text-foreground">A clearer next step.</p><p className="mt-1">Made for careful preparation, not legal certainty.</p></div>
        <div className="flex flex-wrap gap-x-6 gap-y-2"><Link href="/rights" className="hover:text-foreground" data-testid="link-footer-rights">Rights & support</Link><Link href="/library" className="hover:text-foreground" data-testid="link-footer-library">Reference library</Link><span>Information only · check current rules</span></div>
      </div>
    </footer>
  </div>;
}

function Disclaimer({ compact = false }: { compact?: boolean }) {
  return <div className={`flex gap-3 rounded-2xl border border-accent/35 bg-accent/10 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'} text-foreground`} role="note" data-testid="notice-disclaimer">
    <Info className="mt-0.5 shrink-0 text-accent" size={compact ? 17 : 20} />
    <p><strong>General information only.</strong> CourtPath creates an editable draft, not legal advice or an official court form. Check it against the current official form and rules. Where possible, ask a solicitor, law centre, Citizens Advice or legal clinic to review it. A draft is never a guarantee that a court will accept or approve a submission.</p>
  </div>;
}

function Home() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Template['jurisdiction'] | 'All'>('All');
  const visible = selectedJurisdiction === 'All' ? templates : templates.filter(t => t.jurisdiction === selectedJurisdiction);
  const groups = ['Scotland', 'England & Wales', 'European Court of Human Rights'] as const;
  return <Shell><div className="mx-auto max-w-7xl px-5 pb-8 pt-12 lg:px-8 lg:pt-20">
    <section className="grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr]">
      <div className="fade-up"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-primary"><Sparkles size={14} /> Steady help for a difficult process</div>
        <h1 className="max-w-3xl font-display text-5xl leading-[.94] tracking-[-.035em] text-foreground md:text-7xl">Turn a tangled story into a <span className="text-primary">careful first draft.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">CourtPath helps you organise facts, dates and questions for UK civil and family court procedures, especially cases involving children.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#choose" className="rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:-translate-y-0.5" data-testid="link-choose-document">Choose a document <ArrowRight className="ml-2 inline" size={17} /></a><Link href="/rights" className="rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold hover:-translate-y-0.5" data-testid="link-learn-rights">Understand your rights</Link></div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] bg-sidebar p-7 text-sidebar-foreground shadow-xl lg:p-9 fade-up delay-2">
        <div className="absolute -right-14 -top-14 size-48 rounded-full border-[22px] border-sidebar-primary/20" /><div className="absolute -bottom-20 -left-12 size-48 rounded-full border-[18px] border-sidebar-primary/10" />
        <div className="relative"><div className="mb-12 flex items-center justify-between text-xs font-bold uppercase tracking-[.18em] text-sidebar-primary"><span>Your path</span><span>01 / 03</span></div>
          <div className="space-y-7">{[['01', 'Choose the right reference', 'Start with jurisdiction and purpose.'], ['02', 'Answer at your pace', 'Save in this browser as you go.'], ['03', 'Review before sharing', 'Print or download only after checking.']].map(([num, title, copy]) => <div className="flex gap-4" key={num}><span className="grid size-9 shrink-0 place-items-center rounded-full border border-sidebar-primary/50 text-sm font-bold text-sidebar-primary">{num}</span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-sidebar-foreground/65">{copy}</p></div></div>)}</div>
          <div className="mt-10 border-t border-sidebar-border pt-5 text-xs leading-5 text-sidebar-foreground/65">Your answers stay in your browser. There is no account and no submission service.</div>
        </div>
      </div>
    </section>
    <div className="mt-12"><Disclaimer /></div>
    <section id="choose" className="scroll-mt-28 pt-20">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Begin here</p><h2 className="mt-2 font-display text-4xl tracking-tight">What are you preparing?</h2><p className="mt-2 max-w-xl text-muted-foreground">Pick the closest reference. You can change your mind without losing your saved answers.</p></div>
        <div className="flex flex-wrap gap-2">{(['All', ...groups] as const).map(item => <button key={item} onClick={() => setSelectedJurisdiction(item)} className={`rounded-full border px-3.5 py-2 text-xs font-bold ${selectedJurisdiction === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/50'}`} data-testid={`button-filter-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((template, index) => <TemplateCard template={template} key={template.id} index={index} />)}</div>
    </section>
    <section className="mt-20 grid gap-5 border-t border-border pt-10 md:grid-cols-3">{[['Check the source', 'Each guide names the reference it is based on and what it cannot replace.'], ['Keep it factual', 'The prompts are designed to separate dates, observations and concerns.'], ['Ask for a second pair of eyes', 'A legal clinic or trusted adviser can spot gaps the tool cannot.']].map(([title, text]) => <div key={title} className="rounded-2xl bg-muted/55 p-5"><ShieldCheck className="text-primary" size={21} /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</section>
  </div></Shell>;
}

function TemplateCard({ template, index }: { template: Template; index: number }) {
  return <Link href={`/prepare/${template.id}`} className={`lift group flex flex-col rounded-2xl border border-border bg-card p-5 paper-shadow no-underline fade-up delay-${Math.min(index % 3 + 1, 3)}`} data-testid={`card-template-${template.id}`}>
    <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-primary">{iconForJurisdiction(template.jurisdiction)} {template.jurisdiction}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={13} /> {template.estimatedMinutes} min</span></div>
    <p className="mt-6 text-xs font-bold text-muted-foreground">{template.form}</p><h3 className="mt-1 font-display text-2xl leading-tight">{template.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{template.purpose}</p>
    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-bold text-primary group-hover:gap-2"><span>Prepare a draft</span><ChevronRight size={18} /></div>
  </Link>;
}

function Library() {
  const [filter, setFilter] = useState<'All' | Template['jurisdiction']>('All');
  const list = filter === 'All' ? templates : templates.filter(t => t.jurisdiction === filter);
  return <Shell><div className="mx-auto max-w-7xl px-5 pt-12 lg:px-8 lg:pt-18"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Reference shelf</p><h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">The document library, without the fog.</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">Browse the supplied references by jurisdiction and understand what each one is for before you start.</p></div>
    <div className="mt-9 flex flex-wrap gap-2">{(['All', 'Scotland', 'England & Wales', 'European Court of Human Rights'] as const).map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-sm font-bold ${filter === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/50'}`} data-testid={`button-library-filter-${item}`}>{item}</button>)}</div>
    <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">{list.map(template => <div key={template.id} className="grid gap-4 p-5 md:grid-cols-[1fr_1.2fr_auto] md:items-center md:p-7" data-testid={`row-library-${template.id}`}><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-primary">{iconForJurisdiction(template.jurisdiction)} {template.form}</div><h2 className="mt-2 font-display text-2xl">{template.title}</h2><p className="mt-1 text-sm text-muted-foreground">{template.jurisdiction}</p></div><div className="text-sm leading-6 text-muted-foreground"><p><strong className="text-foreground">For:</strong> {template.purpose}</p><p className="mt-2"><strong className="text-foreground">Not for:</strong> replacing the official form, current procedural rules or individual legal advice.</p></div><Link href={`/prepare/${template.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/8" data-testid={`link-library-prepare-${template.id}`}>Open guide <ChevronRight size={16} /></Link></div>)}</div>
     <section className="mt-8">
       <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Related references</p><h2 className="mt-2 font-display text-3xl">Useful forms that are not full drafting flows yet.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">These short notes help you identify the next official form without pretending to replace it.</p></div>
       <div className="grid gap-4 md:grid-cols-3">
         {[['C2', 'In-proceedings application', 'England & Wales form used to ask for permission or a specific order within existing proceedings, such as an interim order or permission to instruct an expert. Check the current C2 and the order or direction you need.'], ['N161', 'Appellant’s notice', 'England & Wales appeal notice used to appeal a Family Court decision to a higher court. Confirm the correct appeal route, permission position and strict time limit before relying on it.'], ['FM1', 'Mediator confirmation', 'A mediator-completed confirmation of attendance at or exemption from a MIAM. It may accompany C100 where relevant; it is not a substitute for C100 or C1A.']].map(([form, title, copy]) => <div key={form} className="rounded-2xl border border-border bg-muted/50 p-5" data-testid={`card-related-${form}`}><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{form}</p><h2 className="mt-2 font-display text-xl">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}
       </div>
       <div className="mt-4 rounded-2xl border border-accent/35 bg-accent/10 p-5 text-sm leading-6" data-testid="note-northern-ireland-forms"><p className="font-bold text-foreground">Northern Ireland is separate.</p><p className="mt-1 text-muted-foreground">Northern Ireland has its own family and civil court form set and procedure. It is not covered by these Scotland or England & Wales guides. Add it as a separate jurisdiction if CourtPath is expanded to cover all four UK jurisdictions.</p></div>
     </section>
    <div className="mt-6"><Disclaimer compact /></div>
  </div></Shell>;
}

function Rights() {
  return <Shell><div className="mx-auto max-w-7xl px-5 pt-12 lg:px-8 lg:pt-18"><div className="grid gap-10 lg:grid-cols-[1fr_360px]"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Know your position</p><h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight tracking-tight md:text-6xl">Rights in plain English, with room for questions.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">A calm orientation based on the supplied Know Your Rights material. It is a starting point for conversations with an adviser, not a legal opinion.</p></div><div className="rounded-2xl bg-sidebar p-6 text-sidebar-foreground"><ShieldCheck className="text-sidebar-primary" size={27} /><h2 className="mt-8 font-display text-2xl">A useful first question</h2><p className="mt-3 text-sm leading-6 text-sidebar-foreground/70">What decision is being made, what information is it based on, and what chance do you have to respond?</p><Link href="/library" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sidebar-primary" data-testid="link-rights-library">Find a preparation guide <ArrowRight size={16} /></Link></div></div>
    <Disclaimer />
    <div className="mt-12 grid gap-4 md:grid-cols-2">{rights.map(([label, title, body]) => <article key={label} className="rounded-2xl border border-border bg-card p-6 paper-shadow" data-testid={`card-right-${label}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{label}</p><h2 className="mt-2 font-display text-2xl">{title}</h2></div><BookOpen className="shrink-0 text-accent" size={20} /></div><p className="mt-4 text-sm leading-7 text-muted-foreground">{body}</p></article>)}</div>
    <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/7 p-6 md:p-8"><h2 className="font-display text-3xl">Places to ask for help</h2><div className="mt-5 grid gap-5 text-sm leading-6 text-muted-foreground md:grid-cols-3"><div><strong className="text-foreground">Urgent safety</strong><p className="mt-1">Call emergency services if there is immediate danger. Specialist domestic abuse and child safety services can help you plan safely.</p></div><div><strong className="text-foreground">Legal support</strong><p className="mt-1">Ask about a solicitor, law centre, Citizens Advice, Civil Legal Advice, legal aid and local legal clinics.</p></div><div><strong className="text-foreground">Access needs</strong><p className="mt-1">Tell the court early about interpretation, disability adjustments, privacy or communication needs.</p></div></div></section>
  </div></Shell>;
}

function makeBlankDraft(template: Template): Draft {
  const values: Record<string, string> = {};
  template.sections.forEach(section => section.fields.forEach(field => { values[field.id] = ''; }));
  return { templateId: template.id, caseName: '', courtReference: '', applicant: '', respondent: '', child: '', dates: '', fieldValues: values, attachments: {}, lastSavedAt: '' };
}

function Prepare() {
  const params = useParams<{ templateId: string }>();
  const template = templates.find(item => item.id === params.templateId);
  if (!template) return <Shell><div className="mx-auto max-w-2xl px-5 py-24 text-center"><FileText className="mx-auto text-primary" size={42} /><h1 className="mt-6 font-display text-4xl">That guide is not available.</h1><Link href="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground" data-testid="link-back-home">Return to guides</Link></div></Shell>;
  return <PrepareWorkspace template={template} />;
}

function PrepareWorkspace({ template }: { template: Template }) {
  const storageKey = `courtpath-draft-${template.id}`;
  const [draft, setDraft] = useState<Draft>(() => {
    try { const saved = localStorage.getItem(storageKey); return saved ? JSON.parse(saved) as Draft : makeBlankDraft(template); } catch { return makeBlankDraft(template); }
  });
  const [step, setStep] = useState(0);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const allSteps = [...template.sections.map(section => ({ kind: 'section' as const, ...section })), { kind: 'evidence' as const, id: 'evidence', title: 'Evidence & attachments', intro: 'Use this checklist to gather supporting material. Uploads are not stored by CourtPath; keep files securely yourself.', fields: [] }, { kind: 'review' as const, id: 'review', title: 'Before you share', intro: 'Read the draft as a whole. Confirm dates, names and the official source before printing.', fields: [] }];
  const current = allSteps[step];
  const requiredFields = template.sections.flatMap(section => section.fields.filter(field => field.required));
  const missing = requiredFields.filter(field => !draft.fieldValues[field.id]?.trim());
  const progress = Math.round((step / (allSteps.length - 1)) * 100);
  useEffect(() => { const timer = window.setTimeout(() => { const next = { ...draft, lastSavedAt: new Date().toISOString() }; localStorage.setItem(storageKey, JSON.stringify(next)); setDraft(next); setSavedNotice(true); window.setTimeout(() => setSavedNotice(false), 1600); }, 500); return () => window.clearTimeout(timer); }, [draft.fieldValues, draft.attachments, storageKey]);
  const updateField = (id: string, value: string) => setDraft(prev => ({ ...prev, fieldValues: { ...prev.fieldValues, [id]: value } }));
  const toggleAttachment = (id: string) => setDraft(prev => ({ ...prev, attachments: { ...prev.attachments, [id]: !prev.attachments[id] } }));
  const resetDraft = () => { if (window.confirm('Clear this draft from this browser?')) { const blank = makeBlankDraft(template); setDraft(blank); localStorage.removeItem(storageKey); setStep(0); } };
  const draftText = useMemo(() => buildDraftText(template, draft), [template, draft]);
  const download = (format: 'txt' | 'html') => { const content = format === 'txt' ? draftText : `<html><head><meta charset="utf-8"><title>${template.form} draft</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;line-height:1.55}h1{font-size:25px}h2{font-size:17px;border-bottom:1px solid #ccc;padding-bottom:5px}.notice{background:#f5ead9;padding:14px}</style></head><body><h1>${template.form}: ${template.title}</h1><div class="notice">General information only. Check against the current official form and rules and seek review where possible.</div><pre style="white-space:pre-wrap;font:inherit">${draftText.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</pre></body></html>`; const blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'text/html' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `courtpath-${template.id}-draft.${format}`; anchor.click(); URL.revokeObjectURL(url); };
  return <Shell><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><div className="no-print flex flex-wrap items-center justify-between gap-4"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground" data-testid="link-prepare-back"><ArrowLeft size={16} /> All guides</Link><div className="flex items-center gap-3 text-xs text-muted-foreground">{savedNotice ? <span className="flex items-center gap-1 text-primary"><Check size={14} /> Saved in this browser</span> : <span>Saved locally as you work</span>}<button onClick={resetDraft} className="rounded-lg px-2 py-1 font-bold text-muted-foreground hover:bg-muted hover:text-destructive" data-testid="button-clear-draft">Clear draft</button></div></div>
    <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px]"><section className="no-print min-w-0"><div className="rounded-2xl border border-border bg-card p-5 paper-shadow md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{template.form} · {template.jurisdiction}</p><h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{template.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{template.purpose}</p></div><div className="hidden rounded-xl bg-primary/10 p-3 text-primary md:block">{iconForJurisdiction(template.jurisdiction)}</div></div><div className="mt-7"><div className="flex justify-between text-xs font-bold text-muted-foreground"><span>Step {step + 1} of {allSteps.length}</span><span>{progress}% mapped</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.max(7, progress)}%` }} /></div><div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">{allSteps.map((item, index) => <button key={item.id} onClick={() => setStep(index)} className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === step ? 'bg-primary text-primary-foreground' : index < step ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`} aria-label={`Go to step ${index + 1}: ${item.title}`} data-testid={`button-step-${index + 1}`}>{index < step ? <Check size={14} /> : index + 1}</button>)}</div></div></div>
        <div className="mt-5"><Disclaimer compact /></div>
        {current.kind === 'section' && <div className="mt-5 rounded-2xl border border-border bg-card p-5 md:p-8 fade-up"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Step {step + 1}</p><h2 className="mt-2 font-display text-3xl">{current.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{current.intro}</p><div className="mt-7 space-y-6">{current.fields.map(field => <FieldControl key={field.id} field={field} value={draft.fieldValues[field.id] || ''} onChange={value => updateField(field.id, value)} />)}</div></div>}
        {current.kind === 'evidence' && <EvidenceStep attachments={draft.attachments} onToggle={toggleAttachment} />}
        {current.kind === 'review' && <ReviewStep template={template} draft={draft} missing={missing} />}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button disabled={step === 0} onClick={() => setStep(v => Math.max(0, v - 1))} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-previous-step"><ArrowLeft size={16} /> Previous</button><div className="flex gap-2"><button onClick={() => setShowPreview(v => !v)} className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-bold text-primary lg:hidden" data-testid="button-toggle-preview"><FileCheck2 size={16} /> {showPreview ? 'Hide preview' : 'See draft'}</button><button disabled={step === allSteps.length - 1} onClick={() => setStep(v => Math.min(allSteps.length - 1, v + 1))} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-next-step">Next <ArrowRight size={16} /></button></div></div>
      </section>
      <aside className={`${showPreview ? 'block' : 'hidden'} xl:block`}><DraftPreview template={template} draft={draft} draftText={draftText} missing={missing} onPrint={() => window.print()} onDownload={download} /></aside></div>
  </div></Shell>;
}

function FieldControl({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  return <div><label htmlFor={`field-${field.id}`} className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-bold"><span>{field.label} {field.required && <span className="text-accent" aria-label="required">*</span>}</span>{field.help && <span className="text-xs font-normal text-muted-foreground">Required information</span>}</label><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{field.help}</p>{field.type === 'textarea' ? <textarea id={`field-${field.id}`} value={value} onChange={event => onChange(event.target.value)} placeholder={field.placeholder} rows={5} className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 placeholder:text-muted-foreground/55" data-testid={`textarea-${field.id}`} /> : field.type === 'select' ? <select id={`field-${field.id}`} value={value} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" data-testid={`select-${field.id}`}><option value="">Choose an option</option>{field.options?.map(option => <option key={option} value={option}>{option}</option>)}</select> : <input id={`field-${field.id}`} type={field.type || 'text'} value={value} onChange={event => onChange(event.target.value)} placeholder={field.placeholder} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/55" data-testid={`input-${field.id}`} />}{field.warning && <div className="mt-2 flex gap-2 rounded-lg bg-accent/10 p-2.5 text-xs leading-5 text-foreground"><CircleHelp className="mt-0.5 shrink-0 text-accent" size={15} />{field.warning}</div>}</div>;
}

function EvidenceStep({ attachments, onToggle }: { attachments: Record<string, boolean>; onToggle: (id: string) => void }) {
  const items = [['official', 'Current official form or rule checked'], ['decision', 'Decision, order or notice saved'], ['dates', 'Chronology or date list checked'], ['supporting', 'Supporting documents gathered'], ['copy', 'Copy for the other person or court considered'], ['advice', 'Review by an adviser requested where possible']];
  return <div className="mt-5 rounded-2xl border border-border bg-card p-5 md:p-8 fade-up"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Step {4}</p><h2 className="mt-2 font-display text-3xl">Evidence & attachments</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Tick what you have checked or gathered. This checklist is not a direction to file everything; the official form and rules decide what is needed.</p><div className="mt-7 grid gap-3">{items.map(([id, label]) => <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${attachments[id] ? 'border-primary/40 bg-primary/7' : 'border-border bg-background'}`}><input type="checkbox" checked={!!attachments[id]} onChange={() => onToggle(id)} className="mt-1 size-4 accent-[hsl(var(--primary))]" data-testid={`checkbox-attachment-${id}`} /><span className="text-sm font-semibold">{label}</span>{attachments[id] && <Check className="ml-auto text-primary" size={17} />}</label>)}</div></div>;
}

function ReviewStep({ template, draft, missing }: { template: Template; draft: Draft; missing: Field[] }) {
  return <div className="mt-5 space-y-5 fade-up"><div className={`rounded-2xl border p-5 md:p-8 ${missing.length ? 'border-accent/40 bg-accent/8' : 'border-primary/30 bg-primary/7'}`}><div className="flex gap-3"><div className="mt-0.5">{missing.length ? <CircleHelp className="text-accent" /> : <CheckCircle2 className="text-primary" />}</div><div><h2 className="font-display text-3xl">{missing.length ? `${missing.length} required ${missing.length === 1 ? 'answer' : 'answers'} still to add` : 'Your required answers are present'}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{missing.length ? 'You can still review the draft, but fill these gaps before relying on it.' : 'Completeness is not correctness. Read the wording and compare it with the official source.'}</p>{missing.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-semibold">{missing.map(field => <li key={field.id}>{field.label}</li>)}</ul>}</div></div></div><Disclaimer /><div className="rounded-2xl border border-border bg-card p-5 md:p-8"><h2 className="font-display text-3xl">Before you print or share</h2><div className="mt-5 space-y-3 text-sm text-muted-foreground">{['I have checked names, dates and the court reference against the source paperwork.', 'I have compared this draft with the current official form and procedural rules.', 'I have separated facts I know from assumptions, opinions and concerns.', 'I have considered safe contact, privacy and any accessibility needs.', 'Where possible, a solicitor, law centre, Citizens Advice or legal clinic has reviewed it.'].map(item => <div className="flex gap-3" key={item}><CheckCircle2 className="shrink-0 text-primary" size={18} /><span>{item}</span></div>)}</div><p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">Source noted for this guide: {template.sourceFile}. Fictional examples, if used, are examples only and must not be copied as facts.</p></div></div>;
}

function DraftPreview({ template, draft, draftText, missing, onPrint, onDownload }: { template: Template; draft: Draft; draftText: string; missing: Field[]; onPrint: () => void; onDownload: (format: 'txt' | 'html') => void }) {
  return <div className="sticky top-24 space-y-4"><div className="no-print flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Live draft</p><p className="mt-1 text-sm text-muted-foreground">{missing.length ? `${missing.length} required gaps` : 'Required fields mapped'}</p></div><div className="flex gap-2"><button onClick={onPrint} className="rounded-lg border border-border bg-card p-2.5 hover:bg-muted" aria-label="Print draft" data-testid="button-print-draft"><Printer size={17} /></button><button onClick={() => onDownload('txt')} className="rounded-lg border border-border bg-card p-2.5 hover:bg-muted" aria-label="Download plain text" data-testid="button-download-text"><Download size={17} /></button></div></div><div className="print-paper rounded-xl border border-border bg-card p-6 paper-shadow md:p-8"><div className="border-b-2 border-foreground/80 pb-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{template.jurisdiction} · {template.form}</p><h2 className="mt-2 font-display text-3xl">{template.title}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Working draft · not an official court form</p></div><div className="mt-5 max-h-[52vh] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-foreground/85">{draftText}</div><div className="mt-6 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">General information only. Check against the current official form and rules. This draft is not guaranteed to be correct or accepted.</div></div><div className="no-print grid grid-cols-2 gap-2"><button onClick={() => onDownload('html')} className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-3 text-xs font-bold text-primary hover:bg-primary/10" data-testid="button-download-html">Download HTML</button><button onClick={onPrint} className="rounded-xl bg-primary px-3 py-3 text-xs font-bold text-primary-foreground hover:-translate-y-0.5" data-testid="button-print-draft-bottom">Print draft</button></div></div>;
}

function buildDraftText(template: Template, draft: Draft) {
  const lines: string[] = [];
  template.sections.forEach(section => { lines.push(`\n${section.title.toUpperCase()}`); section.fields.forEach(field => { const value = draft.fieldValues[field.id]?.trim(); lines.push(`${field.label}: ${value || '[not answered]'}`); }); });
  lines.push('\nEVIDENCE CHECKLIST'); Object.entries(draft.attachments).forEach(([id, checked]) => lines.push(`${checked ? '[x]' : '[ ]'} ${id}`));
  return lines.join('\n');
}

function NotFound() {
  return <Shell><div className="mx-auto max-w-xl px-5 py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><FileText /></div><h1 className="mt-6 font-display text-4xl">Page not found</h1><p className="mt-3 text-muted-foreground">The page you were looking for has moved or does not exist.</p><Link href="/" className="mt-7 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-not-found-home">Go to CourtPath</Link></div></Shell>;
}

const queryClient = new QueryClient();
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function Router() { return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/rights" component={Rights} /><Route path="/library" component={Library} /><Route path="/prepare/:templateId" component={Prepare} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }

export default App;