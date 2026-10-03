export const questions = [
  {
    id: 'for_whom',
    question: 'Voor wie zoeken jullie nu de beste volgende stap?',
    options: [
      { id: 'team', label: 'Voor een team dat praktisch aan de slag wil' },
      { id: 'management', label: 'Voor management dat koers en kaders wil bepalen' },
      { id: 'pioneers', label: 'Voor een kleine kartrekkersgroep die AI verder wil trekken in de organisatie' },
      { id: 'organization', label: 'Voor een organisatievraagstuk dat we eerst scherp moeten krijgen' },
      { id: 'myself', label: 'Voor mezelf' },
    ],
  },
  {
    id: 'ai_usage',
    question: 'Hoe ver zijn jullie al met AI?',
    options: [
      { id: 'none', label: 'We staan nog aan het begin' },
      { id: 'occasional', label: 'Er wordt af en toe mee geëxperimenteerd' },
      { id: 'regular', label: 'AI wordt al regelmatig gebruikt' },
      { id: 'advanced', label: 'Er zijn al eigen GPTs, flows of automatiseringen' },
    ],
  },
  {
    id: 'need_now',
    question: 'Wat hebben jullie nu het hardst nodig?',
    options: [
      { id: 'skills', label: 'Een praktische basis waarmee mensen direct beter werken' },
      { id: 'alignment', label: 'Meer lijn, draagvlak en een slim proces als team' },
      { id: 'build', label: 'Een concrete toepassing bouwen of automatiseren' },
      { id: 'clarity', label: 'Eerst scherp krijgen waar de meeste winst zit' },
    ],
  },
  {
    id: 'desired_impact',
    question: 'Waar moet de eerste opbrengst vooral zitten?',
    options: [
      { id: 'systems_talk', label: 'Minder handwerk tussen systemen en tools' },
      { id: 'build_tool', label: 'Een eigen tool, prototype of assistent bouwen' },
      { id: 'roadmap', label: 'Een scherpe koers voor team of management' },
      { id: 'explore', label: 'Inzicht in kansen, prioriteiten en slim vervolg' },
    ],
  },
];
