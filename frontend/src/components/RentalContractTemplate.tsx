import React from 'react';

interface ContractData {
  startDate?: string;
  endDate?: string;
  landlordName?: string;
  landlordID?: string;
  landlordAddress?: string;
  tenantName?: string;
  tenantID?: string;
  tenantAddress?: string;
  propertyDescription?: string;
  rentAmount?: string;
  depositAmount?: string;
  clauses?: Array<{
    title: string;
    content: string;
  }>;
  landlordSignature?: string;
  tenantSignature?: string;
}

interface RentalContractTemplateProps {
  data?: ContractData;
  isPreview?: boolean;
}

const RentalContractTemplate: React.FC<RentalContractTemplateProps> = ({ 
  data = {}, 
  isPreview = true 
}) => {
  const {
    startDate = '',
    endDate = '',
    landlordName = '',
    landlordID = '',
    landlordAddress = '',
    tenantName = '',
    tenantID = '',
    tenantAddress = '',
    propertyDescription = '',
    rentAmount = '',
    depositAmount = '',
    clauses = [],
    landlordSignature = '',
    tenantSignature = '',
  } = data;

  const BlankField = ({ value, width = "100px" }: { value?: string; width?: string }) => (
    <span 
      style={{ 
        display: 'inline-block',
        borderBottom: '1px solid #000',
        minWidth: width,
        margin: '0 3px',
        padding: '0 5px'
      }}
    >
      {value}
    </span>
  );

  const standardClauses = [
    {
      title: "البند الخامس: تأخر المستأجر عن سداد الإيجار",
      content: "إذا تأخر المستأجر عن دفع الإيجار في الموعد المحدد لمدة تُذكر (المدة المتفق عليها مثلاً شهر أو شهران) من تاريخ استحقاقه، يُعتبر عقد الإيجار هذا مفسوخاً من تلقاء نفسه دون حاجة إلى تنبيه أو إنذار أو إعذار، ودون وجوب الحصول على حكم قضائي. كما يحق للطرف الأول طرد المستأجر وإلزامه بدفع المتأخرات والتعويضات إذا كان لها مبرر قانوني."
    },
    {
      title: "البند السادس: عدم جواز التأجير من الباطن",
      content: "إيجار العين محل العقد من الباطن أو التنازل عنها لغير ليس من حق الطرف الثاني (المستأجر)، وليس من حقه كذلك إحداث أي تغيير بالعين دون إذن كتابي من الطرف الأول (المؤجر). وإذا خالف المستأجر هذا الشرط، يُعتبر العقد مفسوخاً تلقائياً دون حاجة إلى تنبيه أو إنذار أو الحصول على حكم قضائي."
    },
    {
      title: "البند السابع: عدم جواز تغيير الغرض من التأجير",
      content: "استغلال العين محل العقد لغير الغرض المؤجرة من أجله ليس من حق الطرف الثاني (المستأجر)، والغرض هو السكن والمعيشة. وفي حالة حدوث ذلك يُعتبر هذا العقد مفسوخاً من تلقاء نفسه دون حاجة إلى حكم قضائي، أو تنبيه أو إنذار."
    },
    {
      title: "البند الثامن: ما ينفقه المستأجر على العين المؤجرة",
      content: "جميع النفقات التي يتحملها المستأجر على العين المؤجرة بعد تسلمها، مثل الدهانات أو السقف والورق أو الديكور وغيرها، لا يلتزم المؤجر بشيء منها، ولا يحق للمستأجر المطالبة بقيمة ما أنفقه قضاءً أو رضاءً."
    },
    {
      title: "البند التاسع: العناية بالعين المؤجرة",
      content: "يلتزم المستأجر بإجراء الترميمات الضرورية للعين المؤجرة الناتجة عن الاستعمال طوال مدة الإيجار."
    },
    {
      title: "البند العاشر: رد العين المؤجرة بحالتها عند الإيجار",
      content: "يلتزم المستأجر برد العين المؤجرة للطرف الأول عند انتهاء مدة التعاقد، وذلك بالحالة التي عليها وقت التعاقد دون أي تلف، ويتحمل المستأجر كافة النفقات إذا حدث للعين تلفيات ترجع إلى خطأ المستأجر."
    },
    {
      title: "البند الحادي عشر: تسليم العين بعد انتهاء العقد والتعويض عند المماطلة في التسليم",
      content: "لا يحق للطرف الثاني المماطلة أو المنازعة في تسليم العين المؤجرة للطرف الأول عند انتهاء مدة العقد، لأي سبب كان. ويُعتبر وضع يد الطرف الثاني على العين المؤجرة دون عقد جديد بعد انتهاء المدة المحددة في البند الثاني من هذا العقد وضع يد غاصب. ويحق للطرف الأول طرد الطرف الثاني بكافة الوسائل، بما في ذلك استصدار حكم طرد. وفي هذه الحالة، يلتزم المستأجر بدفع تعويض للمؤجر عن الخسائر التي لحقت به من كسب فوت وتقدير مناسب."
    },
    {
      title: "البند الثاني عشر: سداد مستحقات المرافق",
      content: "بموجب عقد الإيجار هذا يلتزم المستأجر بدفع قيمة فواتير المياه والكهرباء والغاز طوال المدة الإيجارية. وفي حالة عدم سدادها، تُعامل هذه المبالغ كالأجرة، ويحق للطرف الأول توقيع حجز على المنقولات الموجودة في العين المؤجرة استيفاءً للمبالغ المطلوبة. كذلك، من حق الطرف الأول أن يطالب الطرف الثاني بهذه المبالغ بالطرق المشروعة قانوناً."
    },
    {
      title: "البند الثالث عشر: رغبة المستأجر في إنهاء العقد قبل نهاية مدته",
      content: "إذا رغب الطرف الثاني في إنهاء هذا العقد قبل نهاية مدته، عليه إخطار الطرف الأول بذلك قبل شهر على الأقل بإنذار رسمي يتم تسليمه بواسطة محضر. في حال عدم امتثال المستأجر لهذا الشرط، يكون المستأجر ملزماً بدفع أجرة شهر كامل بعد تركه العين المؤجرة."
    },
    {
      title: "البند الرابع عشر: العناوين والمراسلات",
      content: "يقر أطراف هذا التعاقد بأن محل الإقامة والعناوين المقررة لكل طرف صحيحة. وأن أي إخطار قانوني أو قضائي أو خطاب موصى بعلم وصوله يتم توجيهه إلى تلك العناوين صحيح."
    },
    {
      title: "البند الخامس عشر: عدد نسخ العقد والاختصاص القضائي",
      content: "حُرر هذا العقد من نسختين، بيد كل طرف نسخة للعمل بها بموجبها عند اللزوم والاقتضاء."
    }
  ];

  const clausesToShow = clauses.length > 0 ? clauses : standardClauses;

  return (
    <div style={{
      fontFamily: "'Times New Roman', serif",
      fontSize: '18px',
      lineHeight: '1.6',
      color: 'black',
      direction: 'rtl',
      textAlign: 'right'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px',
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '30px',
          textDecoration: 'underline'
        }}>
           عقد إيجار شقة
        </div>
        
        <div style={{
          marginBottom: '25px',
          textAlign: 'justify'
        }}>
          إنه في يوم <BlankField value={startDate} width="120px" /> الموافق <BlankField value={startDate} width="120px" /> تحرر هذا العقد بين كلٍ من:
        </div>
        
        <div style={{ margin: '20px 0', padding: '10px 0' }}>
          <strong>أولاً:</strong> د/ السيد <BlankField value={landlordName} width="150px" /> ويحمل بطاقة رقم/ قومي <BlankField value={landlordID} width="150px" /><br />
          ومقيم في/ <BlankField value={landlordAddress} width="200px" /> طرف (أول) مؤجر
        </div>
        
        <div style={{ margin: '20px 0', padding: '10px 0' }}>
          <strong>ثانياً:</strong> د/ السيد <BlankField value={tenantName} width="150px" /> ويحمل بطاقة رقم/ قومي <BlankField value={tenantID} width="150px" /><br />
          ومقيم في/ <BlankField value={tenantAddress} width="200px" /> طرف (ثانٍ) مستأجر
        </div>
        
        <div style={{
          marginBottom: '25px',
          textAlign: 'justify'
        }}>
          وبعد إقرار كلا الطرفين بأهليتهما القانونية اتفقا على ما يأتي:
        </div>
        
        <div style={{ margin: '25px 0', textAlign: 'justify' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            البند الأول: وصف العين المؤجرة
          </div>
          بموجب هذا العقد قد أجر الطرف الأول للطرف الثاني وهو <BlankField value={propertyDescription} width="300px" />
        </div>
        
        <div style={{ margin: '25px 0', textAlign: 'justify' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            البند الثاني: مدة التعاقد
          </div>
          مدة هذا العقد تبدأ من <BlankField value={startDate} width="120px" /> وتنتهي في <BlankField value={endDate} width="120px" /> وينتهي هذا العقد بنهاية مدته دون حاجة إلى تنبيه أو إنذار أو إجراءات أخرى، ولا يُجدد هذا العقد تلقائياً لأي مدة جديدة إلا بعقد اتفاق جديد.
        </div>
        
        <div style={{ margin: '25px 0', textAlign: 'justify' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            البند الثالث: القيمة الإيجارية
          </div>
          قيمة الإيجار المتفق عليها هي مبلغ وقدره <BlankField value={rentAmount} width="100px" /> جنيه مصري شهرياً يدفع المستأجر الإيجار مقدماً في بداية كل شهر إلى المؤجر ويحصل على إيصال بذلك. ويُعتبر المستأجر قد سدد بدل الإيجار إلا إذا كان لديه هذا الإيصال.
        </div>
        
        <div style={{ margin: '25px 0', textAlign: 'justify' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            البند الرابع: التأمين النقدي
          </div>
          يتقاضى الطرف الأول تأميناً نقدياً مبلغ وقدره <BlankField value={depositAmount} width="100px" /> جنيه مصري، ويرد هذا المبلغ للطرف الثاني -المستأجر- في نهاية مدة العقد إن كان له وجه حق فيه.
        </div>
        
        {clausesToShow.map((clause, index) => (
          <div key={index} style={{ margin: '25px 0', textAlign: 'justify' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              {clause.title}
            </div>
            <div dangerouslySetInnerHTML={{ __html: clause.content }} />
          </div>
        ))}
        
        <div style={{
          marginTop: '50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            الطرف الأول المؤجر<br />
            <strong>{landlordName}</strong><br />
            {landlordSignature ? (
              <img 
                src={landlordSignature} 
                alt="توقيع المؤجر" 
                style={{ maxWidth: '150px', maxHeight: '50px', marginTop: '20px' }} 
              />
            ) : (
              <div style={{
                width: '150px',
                marginTop: '20px',
                borderBottom: '1px solid #000',
                height: '20px'
              }}></div>
            )}
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            الطرف الثاني المستأجر<br />
            <strong>{tenantName}</strong><br />
            {tenantSignature ? (
              <img 
                src={tenantSignature} 
                alt="توقيع المستأجر" 
                style={{ maxWidth: '150px', maxHeight: '50px', marginTop: '20px' }} 
              />
            ) : (
              <div style={{
                width: '150px',
                marginTop: '20px',
                borderBottom: '1px solid #000',
                height: '20px'
              }}></div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default RentalContractTemplate;