import Icon from '../../../shared/Icon/Icon';
import s from './SocialLinks.module.scss';

export const SocialLinks = () => {
  return (
    <div className={s.contentContainer}>
      <ul className={s.list}>
        <li className={s.socialLinkList}>
          <a
            href="https://www.instagram.com/"
            className={s.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            <Icon iconName="icon-instagram" className={s.iconInstagram} />
          </a>
        </li>

        <li className={s.socialLinkList}>
          <a
            href="https://t.me/yourchannel"
            className={s.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            title="Telegram"
          >
            <Icon iconName="icon-telegram" className={s.socialsIcon} />
          </a>
        </li>
        <li className={s.socialLinkList}>
          <a
            href="https://wa.me/yournumber"
            className={s.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <Icon iconName="icon-whatsapp" className={s.socialsIcon} />
          </a>
        </li>
        <li className={s.socialLinkList}>
          <a
            href="https://www.linkedin.com/in/yourprofile"
            className={s.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <Icon iconName="icon-linkedin" className={s.socialsIcon} />
          </a>
        </li>
      </ul>
    </div>
  );
};
