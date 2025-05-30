// i edit here and as the components i'll make in the comming days

import '../../styles/wavy/wavy.css';
import LayoutContainer from '../../common/layout_container';
import HowItWorks from '../_templateheaderfooter.for-employers/howitworks/HowItWorks';

import WhyWorkWithUs from '../_templateheaderfooter.for-employers/WhyWorkWithUs';
import FAQ from '../_templateheaderfooter.for-employers/FAQ';
import Topic from './Topic';
import Jobs from './Jobs';
import Achievements from './Achievements';
import Languages from '../_templateheaderfooter.for-employers/Languages';
import SegmentsLanguagesZoomingText from '../_templateheaderfooter.for-employers/SegmentsLanguagesZoomingText';

export default function ForFreelancersPage() {
  return (
    <LayoutContainer>
      <div className="-mx-4">
        <Topic />
      </div>
      <Jobs />
      <div className="-mb-52">
        <Achievements />
      </div>
      <HowItWorks />
      <SegmentsLanguagesZoomingText />
      <WhyWorkWithUs />
      <div className="mb-20">
        <FAQ />
      </div>
    </LayoutContainer>
  );
}
