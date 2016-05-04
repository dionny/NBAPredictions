import weka.classifiers.Classifier;
import weka.classifiers.Evaluation;
import weka.classifiers.bayes.NaiveBayes;
import weka.classifiers.evaluation.NominalPrediction;
import weka.classifiers.functions.Logistic;
import weka.classifiers.functions.MultilayerPerceptron;
import weka.classifiers.functions.SMO;
import weka.classifiers.lazy.IBk;
import weka.classifiers.meta.AdaBoostM1;
import weka.classifiers.trees.DecisionStump;
import weka.classifiers.trees.J48;
import weka.classifiers.trees.LMT;
import weka.core.FastVector;
import weka.core.Instances;
import weka.core.converters.CSVLoader;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class WekaTest {
    public static Evaluation classify(Classifier model,
                                      Instances trainingSet, Instances testingSet) throws Exception {
        Evaluation evaluation = new Evaluation(trainingSet);

        model.buildClassifier(trainingSet);
        evaluation.evaluateModel(model, testingSet);

        return evaluation;
    }

    public static double calculateAccuracy(FastVector predictions) {
        double correct = 0;

        for (int i = 0; i < predictions.size(); i++) {
            NominalPrediction np = (NominalPrediction) predictions.elementAt(i);
            if (np.predicted() == np.actual()) {
                correct++;
            }
        }

        return 100 * correct / predictions.size();
    }

    public static void main(String[] args) throws Exception {
        CSVLoader loader = new CSVLoader();
        loader.setSource(new File(args[0]));
        Instances training = loader.getDataSet();
        training.setClassIndex(training.numAttributes() - 1);
        Instances testInstances = new Instances(training, training.size() - 1, 1);
        training.remove(training.size() - 1);

        AdaBoostM1 adaboost = new AdaBoostM1();
        adaboost.setNumIterations(100);

        // Use a set of classifiers
        Classifier[] arr = {
                adaboost,
                new J48(),
                new NaiveBayes(),
                new LMT(),
                new IBk(3),
                new IBk(5),
                new IBk(7),
                new IBk(15),
                new IBk(40)
        };

        List<Classifier> models = new ArrayList<>(Arrays.asList(arr));

        // Run for each model
        for (int j = 0; j < models.size(); j++) {
            FastVector predictions = new FastVector();
            Evaluation validation = classify(models.get(j), training, testInstances);
            predictions.appendElements(validation.predictions());

            NominalPrediction prediction = ((NominalPrediction) predictions.get(0));

            if(models.get(j) instanceof IBk){
                IBk ibk = (IBk)models.get(j);
                System.out.println(models.get(j).getClass().getSimpleName() + ibk.getKNN() + " " + prediction.predicted());
            } else {
                System.out.println(models.get(j).getClass().getSimpleName() + " " + prediction.predicted());
            }
        }

    }
}