import { Component, signal, inject, computed, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { label: string; action: string }[];
}

@Component({
  selector: 'app-helpdesk-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './helpdesk-chat.component.html'
})
export class HelpdeskChatComponent {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  isOpen = signal(false);
  userInput = signal('');
  isTyping = signal(false);

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: this.languageService.t().helpdesk.welcomeMsg,
      time: 'Just now',
      options: [
        { label: this.languageService.t().helpdesk.optReg, action: 'reg' },
        { label: this.languageService.t().helpdesk.optTraining, action: 'training' },
        { label: this.languageService.t().helpdesk.optAssessment, action: 'assessment' },
        { label: this.languageService.t().helpdesk.optHelpline, action: 'call_181' }
      ]
    }
  ]);

  quickTopics = computed(() => [
    { label: this.t().helpdesk.topicReg, action: 'reg' },
    { label: this.t().helpdesk.topicTraining, action: 'training' },
    { label: this.t().helpdesk.topicPayments, action: 'payments' },
    { label: this.t().helpdesk.topicHelpline, action: 'call_181' }
  ]);

  constructor() {
    effect(() => {
      const t = this.t();
      const isHi = this.languageService.isHindi();
      this.messages.update(msgs => {
        if (msgs.length === 1 && msgs[0].id === '1') {
          return [
            {
              id: '1',
              sender: 'bot',
              text: t.helpdesk.welcomeMsg,
              time: isHi ? 'अभी-अभी' : 'Just now',
              options: [
                { label: t.helpdesk.optReg, action: 'reg' },
                { label: t.helpdesk.optTraining, action: 'training' },
                { label: t.helpdesk.optAssessment, action: 'assessment' },
                { label: t.helpdesk.optHelpline, action: 'call_181' }
              ]
            }
          ];
        }
        return msgs;
      });
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  closeChat() {
    this.isOpen.set(false);
  }

  handleOptionClick(action: string) {
    const isHi = this.languageService.isHindi();
    let userText = '';
    let botReply = '';

    if (isHi) {
      switch (action) {
        case 'reg':
          userText = 'ISMS 2.0 पर पंजीकरण कैसे करें?';
          botReply =
            'ISMS 2.0 पर पंजीकरण के लिए मुख्य बैनर में "प्रारंभ करें" पर क्लिक करें या पंजीकरण मॉड्यूल पर जाएं। आप जन आधार या SSO ID के माध्यम से पंजीकरण कर सकते हैं।';
          break;
        case 'training':
          userText = 'मुझे प्रशिक्षण केंद्र संचालन में सहायता चाहिए।';
          botReply =
            'प्रशिक्षण केंद्र पैनलबद्धता, बैच निर्माण एवं बायोमेट्रिक उपस्थिति संबंधी समस्याओं के लिए कृपया अपने जिला समन्वयक से संपर्क करें अथवा टोल-फ्री 181 पर कॉल करें।';
          break;
        case 'assessment':
          userText = 'मूल्यांकन एवं प्रमाणन प्रक्रिया कैसे कार्य करती है?';
          botReply =
            'मूल्यांकन मान्यता प्राप्त एजेंसियों द्वारा आयोजित किए जाते हैं। आशार्थियों के प्रमाण पत्र डिजिलॉकर एवं ISMS 2.0 पोर्टल के माध्यम से डिजिटल रूप से जारी किए जाते हैं।';
          break;
        case 'payments':
          userText = 'भुगतान एवं चालान स्थिति संबंधी प्रश्न।';
          botReply =
            'प्रशिक्षण साझेदारों द्वारा प्रस्तुत बिल/चालान मील का पत्थर सत्यापन के उपरांत ISMS 2.0 वित्त मॉड्यूल के माध्यम से संसाधित किए जाते हैं।';
          break;
        case 'call_181':
          userText = 'राजस्थान संपर्क हेल्पलाइन से जुड़ें।';
          botReply =
            'राजस्थान संपर्क सीएम हेल्पलाइन 24×7 टोल-फ्री नंबर 181 पर उपलब्ध है। भ्रष्टाचार निरोधक सतर्कता के लिए 1064 डायल करें।';
          break;
        default:
          userText = action;
          botReply =
            'संपर्क करने के लिए धन्यवाद। ISMS 2.0 सहायता टीम से support@isms.rajasthan.gov.in पर भी संपर्क किया जा सकता है।';
      }
    } else {
      switch (action) {
        case 'reg':
          userText = 'How to register on ISMS 2.0?';
          botReply =
            'To register on ISMS 2.0, click on "Get Started" in the top Hero banner or visit the Registration module. You can register using Jan Aadhaar or SSO ID.';
          break;
        case 'training':
          userText = 'I need help with Training Center operations.';
          botReply =
            'For Training Center empanelment, batch creation, and biometric attendance issues, please contact your district coordinator or call Toll-Free 181.';
          break;
        case 'assessment':
          userText = 'How do Assessment and Certification work?';
          botReply =
            'Assessments are conducted through accredited agencies. Candidate certificates are issued digitally via DigiLocker and the ISMS 2.0 portal.';
          break;
        case 'payments':
          userText = 'Payment and Invoice status query.';
          botReply =
            'Invoices submitted by Training Partners are processed through the Finance module on ISMS 2.0 following milestone verification.';
          break;
        case 'call_181':
          userText = 'Connect with Rajasthan Sampark Helpline.';
          botReply =
            'Rajasthan Sampark CM Helpline is available 24×7 toll-free at 181. For Anti-Corruption vigilance, dial 1064.';
          break;
        default:
          userText = action;
          botReply =
            'Thank you for reaching out. An ISMS 2.0 support executive can also be reached at support@isms.rajasthan.gov.in.';
      }
    }

    this.appendMessage('user', userText);
    this.isTyping.set(true);
    this.scrollToBottom();

    setTimeout(() => {
      this.isTyping.set(false);
      this.appendMessage('bot', botReply);
      this.scrollToBottom();
    }, 450);
  }

  sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    this.appendMessage('user', text);
    this.userInput.set('');
    this.isTyping.set(true);
    this.scrollToBottom();

    const isHi = this.languageService.isHindi();
    setTimeout(() => {
      const reply = isHi
        ? 'आपके संदेश के लिए धन्यवाद। ISMS 2.0 सेवाओं की तत्काल सहायता के लिए कृपया टोल-फ्री 181 (राजस्थान संपर्क) डायल करें अथवा support@isms.rajasthan.gov.in पर ईमेल करें।'
        : 'Thank you for your message. For immediate assistance with ISMS 2.0 services, please dial Toll-Free 181 (Rajasthan Sampark) or email support@isms.rajasthan.gov.in.';
      this.isTyping.set(false);
      this.appendMessage('bot', reply);
      this.scrollToBottom();
    }, 500);
  }

  private appendMessage(sender: 'bot' | 'user', text: string) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.update(msgs => [
      ...msgs,
      {
        id: String(Date.now() + Math.random()),
        sender,
        text,
        time
      }
    ]);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTo({
          top: this.messagesContainer.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 60);
  }
}


